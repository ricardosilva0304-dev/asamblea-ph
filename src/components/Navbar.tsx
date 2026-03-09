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
        <nav className="bg-slate-950/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-xl text-white">
                        <Building2 size={20} />
                    </div>
                    <span className="font-black text-white text-lg tracking-tight hidden sm:block">ASAMBLEA PH</span>
                </div>

                {/* Datos y Reloj */}
                <div className="flex items-center">
                    <Reloj />

                    <div className="hidden md:block mr-6 text-right">
                        <p className="text-sm font-bold text-white">{perfil.nombre || perfil.usuario}</p>
                        <p className="text-[10px] text-blue-400 uppercase font-bold tracking-widest">{perfil.rol}</p>
                    </div>

                    <form action={cerrarSesion}>
                        <button
                            type="submit"
                            className="flex items-center gap-2 bg-white/5 hover:bg-red-500/20 text-white hover:text-red-300 border border-white/10 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Salir</span>
                        </button>
                    </form>
                </div>

            </div>
        </nav>
    )
}