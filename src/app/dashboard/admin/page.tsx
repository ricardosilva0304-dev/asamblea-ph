import ResultadosAdmin from '@/components/ResultadosAdmin'
import BannerMensaje from '@/components/BannerMensaje'
import FormCrearUsuario from '@/components/FormCrearUsuario'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">

        <header>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mesa de Control</h1>
          <p className="text-slate-500 mt-1">Monitoreo de votaciones y gestión de usuarios en tiempo real.</p>
        </header>

        <BannerMensaje />
        <ResultadosAdmin />
        <FormCrearUsuario />

      </main>
    </div>
  )
}