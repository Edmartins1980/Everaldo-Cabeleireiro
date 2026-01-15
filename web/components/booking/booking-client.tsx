"use client"

import { sendBookingNotification, sendPushNotification } from "@/lib/actions/notifications"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, addMinutes, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { User } from "@supabase/supabase-js"

// Types
type Service = {
    id: number
    name: string
    price: number
    duration_min: number
}

interface BookingClientProps {
    user: User
    initialServices: Service[] | null
    settings?: Record<string, string>
}

export default function BookingClient({ user, initialServices, settings = {} }: BookingClientProps) {
    const router = useRouter()
    const supabase = createClient()

    // State
    const [step, setStep] = useState(1) // 1: Calendar, 2: Services, 3: Time, 4: Confirm
    const [isSuccess, setIsSuccess] = useState(false)

    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)

    const [services, setServices] = useState<Service[]>(initialServices || [])
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [bookingLoading, setBookingLoading] = useState(false)

    const hasServices = services && services.length > 0;

    // Fetch Services if not passed (fallback)
    useEffect(() => {
        if (!initialServices) {
            const fetchServices = async () => {
                const { data } = await supabase.from("services").select("*").order("name")
                if (data) setServices(data)
            }
            fetchServices()
        }
    }, [initialServices, supabase])

    // Calendar Helpers
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
    })

    // Time Slots Logic
    useEffect(() => {
        if (step === 3 && selectedDate && selectedService) {
            fetchAvailableSlots()
        }
    }, [step, selectedDate, selectedService])

    const fetchAvailableSlots = async () => {
        setLoading(true)
        const startHour = 8
        const endHour = 18
        const interval = 30

        const allSlots: string[] = []
        let current = new Date(selectedDate!)
        current.setHours(startHour, 0, 0, 0)

        const endLimit = new Date(selectedDate!)
        endLimit.setHours(endHour, 0, 0, 0)

        while (current <= endLimit) {
            allSlots.push(format(current, "HH:mm"))
            current = addMinutes(current, interval)
        }

        const startOfDayStr = startOfDay(selectedDate!).toISOString()
        const endOfDayStr = new Date(selectedDate!).setHours(23, 59, 59, 999)
        const endOfDayISO = new Date(endOfDayStr).toISOString()

        // CRITICAL FIX: Fetch ALL appointments for the day to block collisions
        // DO NOT filter by user_id
        const { data: appointments } = await supabase
            .from("appointments")
            .select("start_time, end_time")
            .gte("start_time", startOfDayStr)
            .lte("start_time", endOfDayISO)
            .neq("status", "CANCELLED")

        const busySlots = new Set()

        if (appointments) {
            appointments.forEach(apt => {
                const start = new Date(apt.start_time)
                const end = new Date(apt.end_time)

                let ptr = new Date(start)
                while (ptr < end) {
                    busySlots.add(format(ptr, "HH:mm"))
                    ptr = addMinutes(ptr, interval)
                }
            })
        }

        const validSlots = allSlots.filter(slot => {
            // 1. Se for hoje, remover horários que já passaram (Fuso Brasília UTC-3)
            if (isToday(selectedDate!)) {
                const nowBR = new Intl.DateTimeFormat('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }).format(new Date())

                if (slot <= nowBR) return false
            }

            // 2. Se o horário estiver ocupado
            if (busySlots.has(slot)) return false

            const [h, m] = slot.split(":").map(Number)
            let ptr = new Date(selectedDate!)
            ptr.setHours(h, m, 0, 0)

            let duration = selectedService!.duration_min
            let hasOverlap = false

            for (let i = 0; i < duration; i += interval) {
                // Allow the service to end after 18:00 as long as it starts by 18:00
                // We'll allow up to 60 min after 18:00 for the last appointment to finish
                if (ptr > addMinutes(endLimit, 60)) {
                    hasOverlap = true;
                    break;
                }
                const timeStr = format(ptr, "HH:mm")
                if (busySlots.has(timeStr)) {
                    hasOverlap = true
                    break
                }
                ptr = addMinutes(ptr, interval)
                // If it's a 0-duration check or we just want to allow the START at 18:00
                if (duration === 0) break;
            }

            return !hasOverlap
        })

        setAvailableSlots(validSlots)
        setLoading(false)
    }

    const handleConfirmBooking = async () => {
        if (!selectedService || !selectedDate || !selectedTime) return
        setBookingLoading(true)

        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()

        if (userError || !currentUser) {
            alert("Sessão expirada. Por favor, faça login novamente.")
            window.location.href = "/login?next=/book"
            return
        }

        const [h, m] = selectedTime.split(":").map(Number)
        const startDate = new Date(selectedDate)
        startDate.setHours(h, m, 0, 0)

        // Verificação final de horário passado (Fuso Brasília)
        const nowBR = new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(new Date())

        if (isToday(selectedDate) && selectedTime <= nowBR) {
            alert("Desculpe, este horário acabou de passar. Por favor, escolha outro.")
            setBookingLoading(false)
            fetchAvailableSlots()
            return
        }

        const endDate = addMinutes(startDate, selectedService.duration_min)

        try {
            await supabase.from("profiles").upsert({
                id: currentUser.id,
                name: currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "Cliente",
                role: "CLIENT"
            })
        } catch (e) { console.error(e) }

        const { error } = await supabase.from("appointments").insert({
            user_id: currentUser.id,
            service_id: selectedService.id,
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString(),
            status: "CONFIRMED"
        })

        if (error) {
            console.error("Error creating appointment:", error)
            alert("Erro ao agendar: " + error.message)
            setBookingLoading(false)
        } else {
            // 1. Send Email (Backend - Fire and Forget)
            try {
                sendBookingNotification({
                    customerName: currentUser.user_metadata?.full_name || currentUser.email || "Cliente",
                    serviceName: selectedService.name,
                    date: startDate.toISOString(),
                    time: selectedTime
                })

                // Disparar Push para o Admin
                sendPushNotification({
                    customerName: currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "Cliente",
                    serviceName: selectedService.name,
                    date: startDate.toISOString(),
                    time: selectedTime
                })
            } catch (notifyErr) { console.error(notifyErr) }

            // 2. Open WhatsApp in NEW TAB
            const message = `Olá, agendei um *${selectedService.name}* para dia *${format(startDate, "dd/MM")}* às *${selectedTime}*.`
            const cleanPhone = (settings.whatsapp || "5511995130466").replace(/\D/g, "");
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
            window.open(whatsappUrl, '_blank')

            // 3. Show Success View
            setIsSuccess(true)
            setBookingLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="container max-w-md mx-auto py-20 px-4 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500 relative z-0">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 shadow-sm border border-green-200 dark:border-green-800">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600 dark:text-green-400"
                    >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <path d="m9 11 3 3L22 4" />
                    </svg>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">Agendado!</h1>
                    <p className="text-muted-foreground text-lg">
                        Seu horário está garantido.
                    </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 w-full shadow-sm">
                    <div className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Serviço</span>
                            <span className="font-semibold">{selectedService?.name}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Data</span>
                            <span className="font-semibold">{selectedDate && format(selectedDate, "dd/MM/yyyy")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Horário</span>
                            <span className="font-semibold">{selectedTime}</span>
                        </div>
                    </div>
                </div>

                <div className="w-full pt-6 space-y-3">
                    <Button
                        onClick={() => window.location.reload()}
                        className="w-full h-12 text-lg font-semibold"
                    >
                        Novo Agendamento
                    </Button>
                    <p className="text-xs text-muted-foreground pt-2">
                        Uma confirmação também foi enviada para o seu WhatsApp (se a janela abriu).
                    </p>
                </div>
            </div>
        )
    }

    // Render Steps
    return (
        <div className="container max-w-md mx-auto min-h-screen py-6 px-4 pb-24">
            {/* Step Indicator */}
            <div className="flex justify-between mb-8 px-2">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={cn("h-2 w-[22%] rounded-full transition-colors", i <= step ? "bg-primary" : "bg-secondary")} />
                ))}
            </div>

            {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-2xl font-bold text-center">Escolha a Data</h2>

                    <div className="bg-card border border-border rounded-xl p-4">
                        <div className="flex justify-between items-center mb-4">
                            <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft /></Button>
                            <span className="font-semibold text-lg capitalize">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</span>
                            <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight /></Button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 place-items-center text-center">
                            {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                                <div key={i} className="text-xs font-medium text-muted-foreground py-2">{d}</div>
                            ))}
                            {daysInMonth.map((day) => {
                                const isPast = isBefore(day, startOfDay(new Date()))
                                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                                return (
                                    <button
                                        key={day.toISOString()}
                                        disabled={isPast}
                                        onClick={() => setSelectedDate(day)}
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center text-sm transition-colors",
                                            isSelected ? "bg-primary text-primary-foreground font-bold shadow-md scale-110" : "hover:bg-accent",
                                            isPast && "opacity-30 cursor-not-allowed hover:bg-transparent",
                                            !isSameMonth(day, currentDate) && "opacity-0 pointer-events-none"
                                        )}
                                    >
                                        {format(day, "d")}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <Button
                        className="w-full h-12 text-lg font-bold"
                        disabled={!selectedDate}
                        onClick={() => setStep(2)}
                    >
                        Continuar
                    </Button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setStep(1)}><ChevronLeft /></Button>
                        <h2 className="text-2xl font-bold">Escolha o Serviço</h2>
                    </div>

                    {!hasServices ? (
                        <div className="text-center py-10 border border-dashed border-border rounded-xl">
                            <p className="text-muted-foreground">Carregando serviços...</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {services.map((service) => (
                                <div
                                    key={service.id}
                                    onClick={() => setSelectedService(service)}
                                    className={cn(
                                        "cursor-pointer rounded-xl border p-4 transition-all active:scale-[0.98]",
                                        selectedService?.id === service.id
                                            ? "bg-primary/10 border-primary shadow-[0_0_0_2px_rgba(249,115,22,1)]"
                                            : "bg-card border-border hover:border-primary/50"
                                    )}
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold">{service.name}</h3>
                                        <span className="font-bold text-primary">R$ {service.price}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {service.duration_min} min
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    <Button
                        className="w-full h-12 text-lg font-bold"
                        disabled={!selectedService}
                        onClick={() => setStep(3)}
                    >
                        Continuar
                    </Button>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setStep(2)}><ChevronLeft /></Button>
                        <h2 className="text-2xl font-bold">Escolha o Horário</h2>
                    </div>

                    <p className="text-center text-muted-foreground">
                        {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                    </p>

                    {loading ? (
                        <div className="text-center py-10">Carregando horários...</div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {availableSlots.length > 0 ? availableSlots.map((slot) => (
                                <button
                                    key={slot}
                                    onClick={() => setSelectedTime(slot)}
                                    className={cn(
                                        "py-3 rounded-lg border text-sm font-medium transition-all",
                                        selectedTime === slot
                                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                                            : "bg-card border-border hover:border-primary/50"
                                    )}
                                >
                                    {slot}
                                </button>
                            )) : (
                                <div className="col-span-3 text-center py-8 text-muted-foreground">
                                    Sem horários disponíveis para este dia.
                                </div>
                            )}
                        </div>
                    )}

                    <Button
                        className="w-full h-12 text-lg font-bold"
                        disabled={!selectedTime}
                        onClick={() => setStep(4)}
                    >
                        Revisar
                    </Button>
                </div>
            )}

            {step === 4 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setStep(3)}><ChevronLeft /></Button>
                        <h2 className="text-2xl font-bold">Confirmar</h2>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-lg">
                        <div className="space-y-1 pb-4 border-b border-border">
                            <p className="text-sm text-muted-foreground">Serviço</p>
                            <h3 className="text-xl font-bold">{selectedService?.name}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Data</p>
                                <p className="font-semibold">{selectedDate && format(selectedDate, "dd/MM/yyyy")}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Horário</p>
                                <p className="font-semibold">{selectedTime}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-lg font-medium">Total</span>
                            <span className="text-2xl font-bold text-primary">R$ {selectedService?.price}</span>
                        </div>
                    </div>

                    <Button
                        className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
                        onClick={handleConfirmBooking}
                        disabled={bookingLoading}
                    >
                        {bookingLoading ? "Agendando..." : "CONFIRMAR E ABRIR WHATSAPP"}
                    </Button>
                </div>
            )}
        </div>
    )
}
