import Navbar from '@/components/Navbar'
import ProtectorCierre from '@/components/ProtectorCierre' // Importar el protector

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Añadimos el protector aquí */}
            <ProtectorCierre />

            <Navbar />
            <main className="max-w-6xl mx-auto px-4 py-6 md:py-10">
                {children}
            </main>
        </div>
    )
}