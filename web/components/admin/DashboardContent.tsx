"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Scissors, Trash2, LayoutDashboard, Image as ImageIcon, ShoppingBag, Phone, Save, Plus, Upload, MapPin, Camera, Video, Bell, Instagram, Facebook } from "lucide-react";
import OneSignal from "react-onesignal";
import { handleAction } from "@/app/admin/actions";

interface DashboardContentProps {
    initialActiveTab: string;
    appointments: any[] | null;
    services: any[] | null;
    products: any[] | null;
    gallery: any[] | null;
    settings: Record<string, string>;
}

export default function DashboardContent({ initialActiveTab, appointments, services, products, gallery, settings }: DashboardContentProps) {
    const [activeTab, setActiveTab] = useState(initialActiveTab);
    const [loading, setLoading] = useState<string | null>(null);

    const onAction = async (formData: FormData) => {
        const intent = formData.get("intent");
        setLoading(intent as string);
        const result = await handleAction(formData);
        setLoading(null);
        if (result && !result.success) {
            alert("Erro: " + result.error);
        } else {
            if (intent?.toString().startsWith("create") || intent === "delete") {
                // revalidatePath usually handles this
            }
        }
    };

    const handleDelete = async (id: any, table: string) => {
        if (!confirm("Tem certeza que deseja excluir?")) return;

        const formData = new FormData();
        formData.append("id", id);
        formData.append("table", table);
        formData.append("intent", "delete");

        await onAction(formData);
    };

    const handleSettingSave = async (key: string, value: string) => {
        const formData = new FormData();
        formData.append("intent", "update_settings");
        formData.append("key", key);
        formData.append("value", value);
        await onAction(formData);
    };

    const handleEnableNotifications = async () => {
        const os = (window as any).OneSignal;
        if (os) {
            os.push(async () => {
                try {
                    console.log("Chamando showNativePrompt...");
                    await os.showNativePrompt();

                    const externalId = "admin-" + (settings.whatsapp || "owner").replace(/\D/g, "");
                    await os.login(externalId);
                    await os.User.addTag("role", "admin");

                    alert("Configuração concluída! Se o prompt apareceu, clique em permitir.");
                } catch (err: any) {
                    console.error("Erro ao ativar OneSignal:", err);
                    alert("Erro ao ativar notificações. Verifique se o bloqueador de anúncios está desativado.");
                }
            });
        } else {
            alert("O SDK do OneSignal ainda não carregou. Tente em alguns segundos.");
        }
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-black text-white">
            <aside className="w-full md:w-64 md:fixed md:top-0 md:bottom-0 md:left-0 bg-zinc-950 border-r border-zinc-900 p-6 flex flex-col gap-8 z-50">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black italic tracking-tighter text-orange-500">EVERALDO</h2>
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500">Painel Admin</p>
                </div>

                <nav className="flex flex-col gap-2">
                    {[
                        { id: "agendamentos", label: "Agenda", icon: Clock },
                        { id: "servicos", label: "Serviços", icon: Scissors },
                        { id: "produtos", label: "Produtos", icon: ShoppingBag },
                        { id: "galeria", label: "Galeria", icon: ImageIcon },
                        { id: "contato", label: "Contato", icon: Phone },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === item.id
                                ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20"
                                : "text-zinc-500 hover:text-white hover:bg-zinc-900"
                                }`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-8 border-t border-zinc-900">
                    <button
                        onClick={handleEnableNotifications}
                        className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-4 rounded-2xl hover:border-orange-500 transition-all flex items-center justify-center gap-3 group"
                    >
                        <Bell size={18} className="text-orange-500 group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase text-orange-500">Mobile Push</p>
                            <p className="text-[9px] font-bold text-zinc-500">Ativar Alertas</p>
                        </div>
                    </button>
                </div>
            </aside>

            <main className="flex-1 md:pl-64 w-full min-h-screen flex flex-col overflow-x-hidden">
                <header className="sticky top-0 z-40 w-full bg-black/80 backdrop-blur-xl border-b border-zinc-900/50 flex items-center justify-center md:justify-between p-6 md:px-10 h-24 flex-shrink-0">
                    <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white text-center md:text-left">
                        {activeTab === "agendamentos" && "Agenda"}
                        {activeTab === "servicos" && "Serviços"}
                        {activeTab === "produtos" && "Produtos"}
                        {activeTab === "galeria" && "Galeria"}
                        {activeTab === "contato" && "Contato"}
                    </h1>
                    <div className="hidden md:flex flex-col items-end">
                        <p className="text-[10px] font-black uppercase text-orange-500 tracking-[0.3em]">Everaldo / Admin</p>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{activeTab}</p>
                    </div>
                </header>

                <div className="flex-1 p-6 md:p-10">
                    {activeTab === "agendamentos" && (
                        <div className="space-y-6 max-w-4xl mx-auto">
                            <div className="grid gap-4">
                                {appointments?.map((apt: any) => (
                                    <div key={apt.id} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl flex justify-between items-center text-white group hover:border-orange-500/50 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-orange-500 p-3 rounded-2xl text-black font-black text-center min-w-[65px]">
                                                <span className="block text-2xl">{format(new Date(apt.start_time), "dd")}</span>
                                                <span className="block text-[10px] uppercase">{format(new Date(apt.start_time), "MMM", { locale: ptBR })}</span>
                                            </div>
                                            <div>
                                                <p className="text-xl font-black italic flex items-center gap-2"><Clock size={18} className="text-orange-500" /> {format(new Date(apt.start_time), "HH:mm")}</p>
                                                <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">{apt.profiles?.name} | {apt.services?.name}</p>
                                            </div>
                                        </div>
                                        <button
                                            disabled={loading === "delete"}
                                            onClick={() => handleDelete(apt.id, "appointments")}
                                            className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                                {(!appointments || appointments.length === 0) && (
                                    <p className="text-center py-10 text-zinc-500">Nenhum agendamento encontrado.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "servicos" && (
                        <div className="space-y-8 max-w-4xl mx-auto">
                            <form action={onAction} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl space-y-4">
                                <h3 className="font-bold uppercase text-orange-500 text-xs tracking-widest flex items-center gap-2"><Plus size={14} /> Adicionar Novo Serviço</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input name="n" placeholder="Nome do Serviço" className="bg-black border border-zinc-800 p-3 rounded-xl focus:border-orange-500 outline-none" required />
                                    <input name="p" type="number" step="0.01" placeholder="Preço (R$)" className="bg-black border border-zinc-800 p-3 rounded-xl focus:border-orange-500 outline-none" required />
                                    <input name="d" type="number" placeholder="Duração (min)" className="bg-black border border-zinc-800 p-3 rounded-xl focus:border-orange-500 outline-none" required />
                                </div>
                                <input type="hidden" name="intent" value="create_svc" />
                                <div className="flex justify-center md:justify-start">
                                    <button disabled={loading === "create_svc"} className="bg-orange-500 text-black font-black uppercase italic px-6 py-3 rounded-xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50">
                                        <Save size={18} /> {loading === "create_svc" ? "Salvando..." : "Salvar Serviço"}
                                    </button>
                                </div>
                            </form>

                            <div className="grid gap-4">
                                {services?.map((svc: any) => (
                                    <form key={svc.id} action={onAction} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                        <input name="n" defaultValue={svc.name} className="bg-black border border-zinc-800 p-2 rounded-xl outline-none focus:border-orange-500" />
                                        <input name="p" type="number" step="0.01" defaultValue={svc.price} className="bg-black border border-zinc-800 p-2 rounded-xl outline-none focus:border-orange-500" />
                                        <input name="d" type="number" defaultValue={svc.duration_min} className="bg-black border border-zinc-800 p-2 rounded-xl outline-none focus:border-orange-500" />
                                        <div className="flex gap-2 justify-end">
                                            <input type="hidden" name="id" value={svc.id} />
                                            <input type="hidden" name="intent" value="update_svc" />
                                            <button disabled={!!loading} className="p-3 bg-zinc-800 text-zinc-400 rounded-xl hover:bg-orange-500 hover:text-black transition-all disabled:opacity-50" title="Atualizar"><Save size={18} /></button>
                                            <button
                                                type="button"
                                                disabled={!!loading}
                                                onClick={() => handleDelete(svc.id, "services")}
                                                className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                                title="Excluir"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </form>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "produtos" && (
                        <div className="space-y-8 max-w-4xl mx-auto">
                            <form action={onAction} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl space-y-4">
                                <h3 className="font-bold uppercase text-orange-500 text-xs tracking-widest flex items-center gap-2"><Plus size={14} /> Adicionar Novo Produto</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input name="n" placeholder="Nome do Produto" className="bg-black border border-zinc-800 p-3 rounded-xl focus:border-orange-500 outline-none" required />
                                    <input name="p" type="number" step="0.01" placeholder="Preço (R$)" className="bg-black border border-zinc-800 p-3 rounded-xl focus:border-orange-500 outline-none" required />
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest pl-1">Foto do Produto</label>
                                        <input type="file" name="file" accept="image/*" className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none focus:border-orange-500 file:bg-zinc-800 file:border-none file:text-white file:rounded-lg file:px-3 file:py-1 file:mr-4 file:text-xs file:font-bold hover:file:bg-orange-500 hover:file:text-black cursor-pointer" required />
                                    </div>
                                </div>
                                <input type="hidden" name="intent" value="create_prod" />
                                <div className="flex justify-center md:justify-start">
                                    <button disabled={loading === "create_prod"} className="bg-orange-500 text-black font-black uppercase italic px-6 py-3 rounded-xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50">
                                        <Save size={18} /> {loading === "create_prod" ? "Salvando..." : "Salvar Produto"}
                                    </button>
                                </div>
                            </form>

                            <div className="grid gap-4">
                                {products?.map((prod: any) => (
                                    <form key={prod.id} action={onAction} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl flex flex-col md:flex-row gap-6 items-center">
                                        <div className="w-24 h-24 bg-black rounded-2xl overflow-hidden border border-zinc-800 flex-shrink-0">
                                            <img src={prod.image_url || "https://via.placeholder.com/150"} alt={prod.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold uppercase text-zinc-500">Nome</label>
                                                <input name="n" defaultValue={prod.name} className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none focus:border-orange-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold uppercase text-zinc-500">Preço</label>
                                                <input name="p" type="number" step="0.01" defaultValue={prod.price} className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none focus:border-orange-500" />
                                            </div>
                                            <div className="space-y-1 md:col-span-2">
                                                <label className="text-[10px] font-bold uppercase text-zinc-500">Trocar Foto (Opcional)</label>
                                                <input type="file" name="file" accept="image/*" className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none focus:border-orange-500 file:bg-zinc-800 file:border-none file:text-white file:rounded-lg file:px-3 file:py-1 file:mr-4 file:text-xs file:font-bold hover:file:bg-orange-500 hover:file:text-black cursor-pointer" />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end w-full md:w-auto">
                                            <input type="hidden" name="id" value={prod.id} />
                                            <input type="hidden" name="intent" value="update_prod" />
                                            <button disabled={!!loading} className="p-3 bg-zinc-800 text-zinc-400 rounded-xl hover:bg-orange-500 hover:text-black transition-all disabled:opacity-50" title="Atualizar"><Save size={18} /></button>
                                            <button
                                                type="button"
                                                disabled={!!loading}
                                                onClick={() => handleDelete(prod.id, "products")}
                                                className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                                title="Excluir"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </form>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "galeria" && (
                        <div className="space-y-8 max-w-4xl mx-auto">
                            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl space-y-6">
                                <form action={onAction} className="space-y-4">
                                    <h3 className="font-bold uppercase text-orange-500 text-xs tracking-widest flex items-center gap-2"><Upload size={14} /> Carregar Novo Arquivo</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Tipo de Mídia</label>
                                            <select name="type" className="w-full bg-black border border-zinc-800 p-3 rounded-xl outline-none focus:border-orange-500 appearance-none">
                                                <option value="PHOTO">FOTO</option>
                                                <option value="VIDEO">VÍDEO</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Arquivo</label>
                                            <input type="file" name="file" accept="image/*,video/*" className="w-full bg-black border border-zinc-800 p-2 rounded-xl outline-none focus:border-orange-500 file:bg-zinc-800 file:border-none file:text-white file:rounded-lg file:px-3 file:py-1 file:mr-4 file:text-xs file:font-bold hover:file:bg-orange-500 hover:file:text-black cursor-pointer" required />
                                        </div>
                                    </div>

                                    <input type="hidden" name="intent" value="upload_media" />
                                    <button disabled={loading === "upload_media"} className="w-full bg-orange-500 text-black font-black uppercase italic px-6 py-4 rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                        <Save size={18} /> {loading === "upload_media" ? "Enviando..." : "Subir para Galeria"}
                                    </button>
                                </form>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {gallery?.map((item: any) => (
                                    <div key={item.id} className="group relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-orange-500/50 transition-all">
                                        {item.type === "PHOTO" ? (
                                            <img src={item.url} alt="Gallery" className="w-full h-full object-cover" />
                                        ) : (
                                            <video src={item.url} controls className="w-full h-full object-cover" />
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={() => handleDelete(item.id, "gallery")}
                                                className="p-3 bg-red-500 text-white rounded-xl hover:scale-110 transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                        <div className="absolute top-2 left-2">
                                            <span className="bg-black/80 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest border border-zinc-800">
                                                {item.type === "PHOTO" ? <Camera size={10} className="inline mr-1" /> : <Video size={10} className="inline mr-1" />}
                                                {item.type}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {(!gallery || gallery.length === 0) && (
                                    <div className="col-span-full py-20 text-center border border-dashed border-zinc-800 rounded-3xl">
                                        <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Sua galeria está vazia</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "contato" && (
                        <div className="space-y-8 max-w-4xl mx-auto">
                            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-zinc-500 tracking-widest flex items-center gap-2"><MapPin size={14} /> Endereço da barbearia</label>
                                    <div className="flex gap-2">
                                        <input
                                            id="setting-address"
                                            className="flex-1 bg-black border border-zinc-800 p-3 rounded-xl outline-none focus:border-orange-500"
                                            defaultValue={settings.address || ""}
                                        />
                                        <button
                                            onClick={() => handleSettingSave("address", (document.getElementById("setting-address") as HTMLInputElement).value)}
                                            className="bg-zinc-800 p-3 rounded-xl hover:bg-orange-500 hover:text-black transition-all"
                                        >
                                            <Save size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-zinc-500 tracking-widest flex items-center gap-2"><Phone size={14} /> WhatsApp de Contato</label>
                                    <div className="flex gap-2">
                                        <input
                                            id="setting-whatsapp"
                                            className="flex-1 bg-black border border-zinc-800 p-3 rounded-xl outline-none focus:border-orange-500"
                                            defaultValue={settings.whatsapp || "5511995130466"}
                                        />
                                        <button
                                            onClick={() => handleSettingSave("whatsapp", (document.getElementById("setting-whatsapp") as HTMLInputElement).value)}
                                            className="bg-zinc-800 p-3 rounded-xl hover:bg-orange-500 hover:text-black transition-all"
                                        >
                                            <Save size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* CAMPOS DE REDES SOCIAIS ADICIONADOS AQUI */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-800/50">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2"><Instagram size={14} /> Link do Instagram</label>
                                        <div className="flex gap-2">
                                            <input
                                                id="setting-ig"
                                                className="flex-1 bg-black border border-zinc-800 p-3 rounded-xl outline-none focus:border-orange-500 text-sm"
                                                defaultValue={settings.instagram_url || ""}
                                                placeholder="https://instagram.com/..."
                                            />
                                            <button
                                                onClick={() => handleSettingSave("instagram_url", (document.getElementById("setting-ig") as HTMLInputElement).value)}
                                                className="bg-zinc-800 p-3 rounded-xl hover:bg-orange-500 hover:text-black transition-all"
                                            >
                                                <Save size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2"><Facebook size={14} /> Link do Facebook</label>
                                        <div className="flex gap-2">
                                            <input
                                                id="setting-fb"
                                                className="flex-1 bg-black border border-zinc-800 p-3 rounded-xl outline-none focus:border-orange-500 text-sm"
                                                defaultValue={settings.facebook_url || ""}
                                                placeholder="https://facebook.com/..."
                                            />
                                            <button
                                                onClick={() => handleSettingSave("facebook_url", (document.getElementById("setting-fb") as HTMLInputElement).value)}
                                                className="bg-zinc-800 p-3 rounded-xl hover:bg-orange-500 hover:text-black transition-all"
                                            >
                                                <Save size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}