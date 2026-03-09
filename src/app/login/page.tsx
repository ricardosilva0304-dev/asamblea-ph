import { login } from './actions'
import { Building2 } from 'lucide-react' // Asegúrate de tener instalado lucide-react

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params?.error

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Fondo con efecto decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/50 via-slate-950 to-slate-950"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Tarjeta con efecto glassmorphism */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl">

          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-600/50 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
              <Building2 size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Asamblea PH</h1>
            <p className="text-blue-200/70 font-medium">Agrupación Residencial El Parque de las Flores</p>
            <p className="text-blue-200/70 font-medium">NIT. 832.011.421-3</p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-blue-200 uppercase tracking-widest mb-3 ml-1">
                Usuario
              </label>
              <input
                name="usuario"
                type="text"
                required
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:bg-white/10 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg"
                placeholder="Ej: Apto 101"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-200 uppercase tracking-widest mb-3 ml-1">
                Contraseña
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:bg-white/10 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-2xl text-sm text-center">
                {error}
              </div>
            )}

            <button
              formAction={login}
              className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-blue-900/50 mt-4 text-lg"
            >
              Entrar a la Sesión
            </button>
          </form>

          <p className="text-center text-white/30 text-xs mt-8">
            Asamblea PH © 2026 - Seguridad Privada
          </p>
        </div>
      </div>
    </div>
  )
}