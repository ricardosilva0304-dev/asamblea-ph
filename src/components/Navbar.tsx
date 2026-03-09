import { cerrarSesion } from '@/app/accionesAuth'
import { createClient } from '@/utils/supabase/server'

export default async function Navbar() {
    const supabase = await createClient()

    // Obtenemos el usuario actual
    const { data: { user } } = await supabase.auth.getUser()

    let nombreAMostrar = 'Usuario'
    let rolUsuario = ''

    // Si hay usuario, buscamos su perfil para saber su nombre y rol
    if (user) {
        const { data: perfil } = await supabase
            .from('perfiles')
            .select('nombre, usuario, rol')
            .eq('id', user.id)
            .single()

        // Si no tiene nombre (porque lo creamos antes), mostramos su usuario (ej: apto101)
        nombreAMostrar = perfil?.nombre || perfil?.usuario || 'Usuario'
        rolUsuario = perfil?.rol || ''
    }

    return (
        <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">

                {/* Logo / Título */}
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white p-2 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                    </div>
                    <span className="font-bold text-xl text-blue-900 hidden sm:block">
                        Asamblea en Línea
                    </span>
                </div>

                {/* Datos del Usuario y Botón */}
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-800">{nombreAMostrar}</p>
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                            {rolUsuario}
                        </p>
                    </div>

                    <form action={cerrarSesion}>
                        <button
                            type="submit"
                            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                            </svg>
                            Salir
                        </button>
                    </form>
                </div>

            </div>
        </nav>
    )
}