import ControlProgramador from "@/components/ControlProgramador";

export default function ProgramadorDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Centro de Operaciones
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Gestiona la dinámica en tiempo real de la asamblea.
            <span className="block text-sm mt-1 opacity-75">Las acciones se reflejarán instantáneamente en la pantalla principal.</span>
          </p>
        </div>
        <ControlProgramador />
      </div>
    </div>
  )
}