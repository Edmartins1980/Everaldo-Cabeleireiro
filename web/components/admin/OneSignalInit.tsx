"use client"

import { useEffect } from "react"
import OneSignal from "react-onesignal"

export default function OneSignalInit() {
    useEffect(() => {
        console.log("🚀 [OneSignal] Iniciando carregamento...");

        const timer = setTimeout(async () => {
            if (typeof window !== "undefined") {
                try {
                    console.log("⚙️ [OneSignal] Configurando SDK...");

                    await OneSignal.init({
                        appId: "b990cc83-c3e9-489c-8572-91788099673b",
                        allowLocalhostAsSecureOrigin: true,
                        notifyButton: {
                            enable: false,
                            prenotify: false,
                            showCredit: false,
                            text: {
                                'tip.state.unsubscribed': 'Inscreva-se',
                                'tip.state.subscribed': 'Inscrito',
                                'tip.state.blocked': 'Bloqueado',
                                'message.prenotify': 'Clique para se inscrever',
                                'message.action.subscribed': 'Obrigado!',
                                'message.action.subscribing': 'Inscrevendo...',
                                'message.action.resubscribed': 'Inscrito!',
                                'message.action.unsubscribed': 'Desinscrito',
                                'dialog.main.title': 'Notificações',
                                'dialog.main.button.subscribe': 'INSCREVER',
                                'dialog.main.button.unsubscribe': 'DESINSCREVER',
                                'dialog.blocked.title': 'Bloqueado',
                                'dialog.blocked.message': 'Permita nas configurações'
                            }
                        }
                    });

                    console.log("✅ [OneSignal] SDK inicializado com sucesso!");
                    console.log("🔧 [OneSignal] Localhost permitido:", true);

                } catch (err: any) {
                    console.error("❌ [OneSignal] Erro na inicialização:", err);
                    console.error("❌ [OneSignal] Detalhes:", err.message);
                }
            }
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return null;
}
