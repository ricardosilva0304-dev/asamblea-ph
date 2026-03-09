import ControlProgramador from "@/components/ControlProgramador"

export default function ProgramadorDashboard() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">

      {/* BACKGROUND GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-black"></div>

      {/* LIGHT BLOBS */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-indigo-600/30 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-purple-600/30 blur-[150px] rounded-full"></div>
      <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-cyan-500/20 blur-[120px] rounded-full"></div>

      <div className="relative z-10 px-8 py-14">

        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <header className="mb-16 flex flex-col lg:flex-row lg:items-center justify-between gap-10">

            <div>
              <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 text-transparent bg-clip-text">
                Control Central
              </h1>

              <p className="text-slate-400 mt-4 text-lg max-w-xl">
                Panel maestro para gestionar encuestas, mensajes y control de
                sistema en tiempo real.
              </p>
            </div>

            {/* STATUS PANEL */}
            <div className="flex items-center gap-6">

              <div className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-xl px-6 py-3 rounded-xl">

                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>

                <span className="text-xs font-bold tracking-widest text-slate-300">
                  SISTEMA OPERATIVO
                </span>

              </div>

              <div className="bg-white/5 border border-white/10 backdrop-blur-xl px-6 py-3 rounded-xl text-xs font-bold text-slate-300 tracking-widest">
                PROGRAMADOR
              </div>

            </div>

          </header>

          <ControlProgramador />

        </div>

      </div>
    </div>
  )
}