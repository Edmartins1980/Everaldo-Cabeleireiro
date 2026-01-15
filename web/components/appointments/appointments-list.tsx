"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Clock, Scissors, Trash2, CheckSquare, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
// Import Server Actions
import { deleteAppointment as deleteAppointmentAction, deleteAppointmentsBulk } from "@/lib/actions/appointments"
import { useRouter } from "next/navigation"

export default function AppointmentsList({ initialAppointments }: { initialAppointments: any[] }) {
    // We initialize with props, but we will let router.refresh() update the props naturally.
    // However, to make it snappy, we still filter locally BUT only if success.
    const [appointments, setAppointments] = useState(initialAppointments || [])
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const toggleSelection = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const toggleAll = () => {
        if (selectedIds.length === appointments.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(appointments.map(a => a.id))
        }
    }

    const handleDeleteSingle = async (id: number) => {
        if (!confirm("Tem certeza que deseja cancelar este agendamento?")) return

        setLoading(true)
        const result = await deleteAppointmentAction(id)

        if (result.error) {
            alert("Erro ao excluir: " + result.error)
            // Do NOT remove from list if error
        } else {
            // Success: Remove from local state
            setAppointments(prev => prev.filter(a => a.id !== id))
            setSelectedIds(prev => prev.filter(i => i !== id))
            router.refresh()
        }
        setLoading(false)
    }

    const handleDeleteBulk = async () => {
        if (!confirm(`Tem certeza que deseja excluir ${selectedIds.length} agendamentos?`)) return

        setLoading(true)
        const result = await deleteAppointmentsBulk(selectedIds)

        if (result.error) {
            alert("Erro ao excluir: " + result.error)
            // Do NOT remove from list if error
        } else {
            // Success: Remove from local state
            setAppointments(prev => prev.filter(a => !selectedIds.includes(a.id)))
            setSelectedIds([])
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <div className="space-y-4">

            {/* Bulk Actions Header */}
            {appointments.length > 0 && (
                <div className="flex justify-between items-center bg-card p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={toggleAll}>
                        {selectedIds.length === appointments.length && appointments.length > 0 ? (
                            <CheckSquare className="h-5 w-5 text-primary" />
                        ) : (
                            <Square className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium">
                            {selectedIds.length > 0 ? `${selectedIds.length} selecionados` : "Selecionar Todos"}
                        </span>
                    </div>

                    {selectedIds.length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteBulk}
                            disabled={loading}
                        >
                            Excluir Selecionados
                        </Button>
                    )}
                </div>
            )}

            {/* List */}
            {appointments.length > 0 ? (
                appointments.map((apt) => (
                    <div
                        key={apt.id}
                        className={cn(
                            "group bg-card border rounded-xl p-4 shadow-sm flex flex-col gap-3 transition-colors",
                            selectedIds.includes(apt.id) ? "border-primary/50 bg-primary/5" : "border-border"
                        )}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                {/* Checkbox */}
                                <div onClick={() => toggleSelection(apt.id)} className="cursor-pointer">
                                    {selectedIds.includes(apt.id) ? (
                                        <CheckSquare className="h-5 w-5 text-primary" />
                                    ) : (
                                        <Square className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <Scissors className="h-4 w-4 text-primary" />
                                        {apt.services?.name || "Serviço"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {format(new Date(apt.start_time), "dd 'de' MMMM", { locale: ptBR })}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right flex items-center gap-4">
                                <span className="font-bold text-primary">R$ {apt.services?.price}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteSingle(apt.id)}
                                    title="Excluir Agendamento"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm bg-secondary/50 p-2 rounded-lg ml-8">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                                {format(new Date(apt.start_time), "HH:mm")}
                            </span>
                            <span className="text-muted-foreground">
                                ({apt.services?.duration_min} min)
                            </span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                    <p className="text-muted-foreground">Você ainda não tem agendamentos.</p>
                </div>
            )}
        </div>
    )
}
