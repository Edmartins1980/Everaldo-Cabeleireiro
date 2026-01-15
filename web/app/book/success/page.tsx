'use client';

import React from 'react';

export default function SuccessPage() {
    const handleAction = (path: string) => {
        window.location.assign(path);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <nav className="p-4 border-b border-gray-800 flex justify-between items-center bg-black">
                <span className="text-orange-500 font-bold text-xl uppercase tracking-tighter">MEU AGENDAMENTO</span>
                <button
                    onClick={() => handleAction('/login')}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-bold uppercase transition-all"
                >
                    Sair
                </button>
            </nav>

            <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-10 rounded-2xl shadow-2xl">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/50">
                        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black mb-4 text-white uppercase italic">Confirmado!</h1>
                    <p className="text-gray-400 mb-10 text-lg">Seu horário foi reservado. Verifique seu WhatsApp.</p>

                    <button
                        onClick={() => handleAction('/')}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-xl font-black text-xl uppercase tracking-widest transition-all"
                    >
                        Voltar ao Início
                    </button>
                </div>
            </div>
        </div>
    );
}
