import { cerrarSesion } from '@/app/accionesAuth'
import { createClient } from '@/utils/supabase/server'
import { LogOut, Building2 } from 'lucide-react'
import Reloj from './Reloj'

export default async function Navbar() {

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    let perfil = {
        nombre: 'Usuario',
        usuario: '',
        rol: ''
    }

    if (user) {

        const { data } = await supabase
            .from('perfiles')
            .select('nombre, usuario, rol')
            .eq('id', user.id)
            .single()

        if (data) perfil = data

    }

    return (

        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-xl">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex h-16 items-center justify-between">

                    {/* LOGO */}

                    <div className="flex items-center gap-3">

                        <div className="relative">

                            <div className="absolute inset-0 bg-blue-500 blur-md opacity-40 rounded-xl"></div>

                            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg">
                                <Building2 size={20} />
                            </div>

                        </div>

                        <span className="hidden sm:block font-black text-white tracking-tight text-lg">
                            ASAMBLEA PH
                        </span>

                    </div>


                    {/* RIGHT AREA */}

                    <div className="flex items-center gap-4 md:gap-6">

                        <Reloj />


                        {/* USER */}

                        <div className="hidden sm:flex flex-col text-right">

                            <span className="text-sm font-semibold text-white leading-tight">

                                {perfil.nombre || perfil.usuario}

                            </span>

                            <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">

                                {perfil.rol}

                            </span>

                        </div>


                        {/* LOGOUT */}

                        <form action={cerrarSesion}>

                            <button
                                type="submit"
                                className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-500/20 hover:text-red-300"
                            >

                                <LogOut
                                    size={16}
                                    className="opacity-80 group-hover:opacity-100"
                                />

                                <span className="hidden sm:inline">
                                    Salir
                                </span>

                            </button>

                        </form>

                    </div>

                </div>

            </div>

        </nav>

    )

}