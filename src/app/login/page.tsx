import { login } from './actions'
import { Building2, Lock, User } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params?.error

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Fondo animado sutil */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]"></div>
        <div className="absolute top-[30%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Tarjeta de Login */}
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">

          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6">
              <Building2 size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Asamblea PH</h1>
            <p className="text-blue-200/60 font-medium text-sm">Residencial El Parque de las Flores</p>
          </div>

          <form className="space-y-5">
            <div className="group">
              <label className="block text-[10px] font-bold text-blue-300/50 uppercase tracking-widest mb-2 ml-1">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors" size={20} />
                <input
                  name="usuario"
                  type="text"
                  required
                  className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:bg-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-lg"
                  placeholder="Ej: Apto 101"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-bold text-blue-300/50 uppercase tracking-widest mb-2 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors" size={20} />
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:bg-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-lg"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-2xl text-sm text-center font-medium animate-pulse">
                {error}
              </div>
            )}

            <button
              formAction={login}
              className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 mt-4 text-lg border border-blue-400/20"
            >
              Entrar a la Sesión
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-white/20 text-[10px] uppercase tracking-widest">
              Seguridad Privada • Asamblea PH 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}