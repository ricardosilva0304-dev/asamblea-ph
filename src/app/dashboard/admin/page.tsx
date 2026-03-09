import ResultadosAdmin from '@/components/ResultadosAdmin'
import BannerMensaje from '@/components/BannerMensaje'
import FormCrearUsuario from '@/components/FormCrearUsuario' // NUEVO IMPORT

export default function AdminDashboard() {
  return (
    <div className="max-w-5xl mx-auto p-6 mt-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800">Mesa de Control - Administrador</h1>
        <p className="text-gray-600">Visualización de resultados de la asamblea en tiempo real.</p>
      </div>

      <BannerMensaje />
      <ResultadosAdmin />

      {/* AÑADIMOS EL FORMULARIO AQUÍ ABAJO */}
      <FormCrearUsuario />

    </div>
  )
}