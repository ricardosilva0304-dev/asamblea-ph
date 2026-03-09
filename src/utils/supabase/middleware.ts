import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    // 1. Crear una respuesta inicial
    let supabaseResponse = NextResponse.next({
        request,
    })

    // 2. Configurar el cliente de Supabase para el Middleware
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 3. Obtener el usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    const pathname = request.nextUrl.pathname

    // === REGLAS DE SEGURIDAD ===

    // A. Si intenta entrar a cualquier ruta dentro de /dashboard
    if (pathname.startsWith('/dashboard')) {

        // Si NO está logueado, patada al login
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        // Si SÍ está logueado, buscamos su rol en la base de datos
        const { data: perfil } = await supabase
            .from('perfiles')
            .select('rol')
            .eq('id', user.id)
            .single()

        const rol = perfil?.rol

        // Si por alguna razón no tiene rol, lo mandamos al login
        if (!rol) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            url.searchParams.set('error', 'Usuario sin rol asignado')
            return NextResponse.redirect(url)
        }

        // B. Verificamos que no se meta en la carpeta de otro rol
        if (pathname.startsWith('/dashboard/programador') && rol !== 'programador') {
            return NextResponse.redirect(new URL(`/dashboard/${rol}`, request.url))
        }

        if (pathname.startsWith('/dashboard/admin') && rol !== 'admin') {
            return NextResponse.redirect(new URL(`/dashboard/${rol}`, request.url))
        }

        if (pathname.startsWith('/dashboard/propietario') && rol !== 'propietario') {
            return NextResponse.redirect(new URL(`/dashboard/${rol}`, request.url))
        }

        // C. Si entra exactamente a "/dashboard" (sin subcarpeta), lo redirigimos a su carpeta correcta
        if (pathname === '/dashboard') {
            return NextResponse.redirect(new URL(`/dashboard/${rol}`, request.url))
        }
    }

    // D. Si un usuario ya logueado intenta ir a la página de "/login", lo mandamos a su dashboard
    if (pathname === '/login' && user) {
        const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
        return NextResponse.redirect(new URL(`/dashboard/${perfil?.rol || 'propietario'}`, request.url))
    }

    return supabaseResponse
}