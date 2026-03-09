import ControlProgramador from "@/components/ControlProgramador";

export default function ProgramadorDashboard() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Encabezado con Estilo Moderno */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Centro de Operaciones
          </h1>
          <p className="mt-3 text-lg text-slate-500 max-w-xl font-medium">
            Gestiona la dinámica en tiempo real. 
            <span className="text-indigo-600 font-bold ml-2">Todas las acciones son instantáneas.</span>
          </p>
        </div>
        
        {/* Etiqueta de estado del sistema */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Sistema en línea</span>
        </div>
      </div>

      {/* Componente de control */}
      <ControlProgramador />
    </div>
  )
}