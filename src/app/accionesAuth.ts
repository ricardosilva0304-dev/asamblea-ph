'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function cerrarSesion() {
    const supabase = await createClient()

    // Cerramos la sesión en Supabase (borra las cookies de forma segura)
    await supabase.auth.signOut()

    // Redirigimos al login
    redirect('/login')
}