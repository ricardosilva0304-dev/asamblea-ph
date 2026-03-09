import { login } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-2xl">

        {/* LOGO - Aquí puedes poner tu logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-white font-black text-2xl">PH</span>
          </div>
          {/* Si tienes un logo, borra el div de arriba y usa esto:
          <img src="/tu-logo.png" alt="Logo" className="h-16 w-16" /> 
          */}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Bienvenido</h1>
          <p className="text-slate-500 text-sm mt-1">Acceso a la Asamblea PH</p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Usuario
            </label>
            <input
              name="usuario"
              type="text"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Ej: apto101"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            formAction={login}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 mt-2"
          >
            Ingresar a la Asamblea
          </button>
        </form>
      </div>
    </div>
  )
}