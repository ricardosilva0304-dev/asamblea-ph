'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const usuario = formData.get('usuario') as string
    const password = formData.get('password') as string

    const emailFicticio = `${usuario.toLowerCase().trim()}@asamblea.local`

    // 1. Intentamos iniciar sesión
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailFicticio,
        password,
    })

    if (authError || !authData.user) {
        return redirect('/login?error=Credenciales incorrectas')
    }

    // 2. Si el login es exitoso, buscamos el rol en la tabla perfiles
    const { data: perfilData, error: perfilError } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', authData.user.id)
        .single()

    if (perfilError || !perfilData) {
        // Si no tiene un perfil creado, cerramos la sesión por seguridad
        await supabase.auth.signOut()
        return redirect('/login?error=Usuario sin perfil asignado')
    }

    // 3. Redirigimos según el rol
    const rol = perfilData.rol

    if (rol === 'programador') {
        redirect('/dashboard/programador')
    } else if (rol === 'admin') {
        redirect('/dashboard/admin')
    } else {
        redirect('/dashboard/propietario')
    }
}