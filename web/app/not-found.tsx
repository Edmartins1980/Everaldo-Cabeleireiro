export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-black text-white">
            <h1 className="text-4xl font-bold text-orange-500 mb-4 italic uppercase">404</h1>
            <h2 className="text-2xl font-bold mb-4">Página Não Encontrada</h2>
            <p className="text-gray-400 mb-8 max-w-md">
                A página que você está procurando não existe ou foi movida.
            </p>
            <a
                href="/"
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold uppercase transition-all"
            >
                Voltar para a Home
            </a>
        </div>
    );
}
