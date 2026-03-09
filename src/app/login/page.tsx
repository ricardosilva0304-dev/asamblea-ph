import { login } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  // Nota: Dejamos el acceso a params directamente
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">Agrupación Residencial</span>
            <span className="text-white font-bold text-xl">El Parque de las Flores</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Bienvenido</h1>
          <p className="text-slate-500 text-sm mt-1">Ingresa a la asamblea</p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Usuario</label>
            <input name="usuario" type="text" required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ej: apto101" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Contraseña</label>
            <input name="password" type="password" required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••" />
          </div>

          <button formAction={login} className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-200">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )
}