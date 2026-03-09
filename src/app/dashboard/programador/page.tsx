import ControlProgramador from '@/components/ControlProgramador'

export default function ProgramadorDashboard() {
  return (
    <div className="max-w-6xl mx-auto p-6 mt-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Centro de Operaciones</h1>
        <p className="text-gray-600 mt-2">
          Desde aquí puedes lanzar votaciones y enviar anuncios en pantalla.
          Al lanzar una nueva votación, la anterior se cerrará automáticamente.
        </p>
      </div>

      <ControlProgramador />
    </div>
  )
}