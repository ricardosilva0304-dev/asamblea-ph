import { cerrarSesion } from '@/app/accionesAuth'
import { createClient } from '@/utils/supabase/server'
import { LogOut, Building2 } from 'lucide-react'
import Reloj from './Reloj'

export default async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let perfil = { nombre: 'Usuario', usuario: '', rol: '' }
    if (user) {
        const { data } = await supabase.from('perfiles').select('nombre, usuario, rol').eq('id', user.id).single()
        if (data) perfil = data
    }

    return (
        <nav className="sticky top-0 z-50 w-full bg-black border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">

                    {/* LOGO */}
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg text-black">
                            <Building2 size={20} strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-white tracking-tight text-lg">
                            ASAMBLEA PH
                        </span>
                    </div>

                    {/* RIGHT AREA */}
                    <div className="flex items-center gap-6">
                        <Reloj />

                        {/* USER INFO */}
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-sm font-medium text-white">{perfil.nombre || perfil.usuario}</span>
                            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{perfil.rol}</span>
                        </div>

                        {/* LOGOUT */}
                        <form action={cerrarSesion}>
                            <button
                                type="submit"
                                className="flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 hover:border-slate-600 transition-colors"
                            >
                                <LogOut size={16} />
                                <span className="hidden sm:inline">Salir</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </nav>
    )
}