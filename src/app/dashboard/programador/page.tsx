import ControlProgramador from "@/components/ControlProgramador"

export default function ProgramadorDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-8 py-14">

        {/* HEADER */}
        <header className="mb-16 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Control Central
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Panel maestro para gestionar encuestas y anuncios.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">Sistema Activo</span>
            </div>
          </div>
        </header>

        <ControlProgramador />
      </div>
    </div>
  )
}