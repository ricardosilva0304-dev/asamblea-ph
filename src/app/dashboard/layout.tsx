import Navbar from '@/components/Navbar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* El Navbar aparecerá arriba en todas las páginas del dashboard */}
            <Navbar />

            {/* Aquí abajo se renderizará el panel del admin, programador o propietario */}
            <main className="pb-12">
                {children}
            </main>
        </div>
    )
}