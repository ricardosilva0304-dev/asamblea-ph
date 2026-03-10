import { login } from './actions'
import { Lock, User } from 'lucide-react'
// Importa Image de Next.js si prefieres optimizar la imagen (opcional)
// import Image from 'next/image'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params?.error

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      {/* Fondo claro animado sutil (mantiene el dinamismo pero en tonos muy suaves) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-200/30 blur-[120px]"></div>
        <div className="absolute top-[30%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-200/30 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Tarjeta de Login (Ahora blanca con una sombra suave) */}
        <div className="bg-white border border-slate-100 p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/60">

          <div className="flex flex-col items-center text-center mb-10">
            {/* 
              CONTENEDOR DEL LOGO 
              Reemplaza '/tu-logo.png' por la ruta de tu imagen real. 
              Asegúrate de que la imagen esté dentro de la carpeta 'public' de tu proyecto Next.js.
            */}
            <div className="h-24 w-auto mb-6 flex items-center justify-center">
              <img
                src="/tu-logo.png"
                alt="Logo Asamblea PH"
                className="max-h-full object-contain drop-shadow-sm"
              />
            </div>

            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Asamblea PH</h1>
            <p className="text-slate-500 font-medium text-sm">Agrupación Residencial El Parque de las Flores</p>
          </div>

          <form className="space-y-5">
            <div className="group">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  name="usuario"
                  type="text"
                  required
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-lg"
                  placeholder="Ej: Apto 101"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-lg"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Mensaje de error adaptado a modo claro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-sm text-center font-medium animate-pulse">
                {error}
              </div>
            )}

            <button
              formAction={login}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-5 rounded-2xl transition-all shadow-lg shadow-blue-600/25 mt-4 text-lg border-none"
            >
              Entrar a la Sesión
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest">
              Seguridad Privada • Asamblea PH 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}