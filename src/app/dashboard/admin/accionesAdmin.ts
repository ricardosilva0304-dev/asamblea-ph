'use server'

import { createClient as createServerClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function crearPropietario(formData: FormData) {
    // 1. Verificamos quién está intentando hacer esto
    const supabaseAuth = await createServerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()

    if (!user) return { error: 'No autorizado' }

    const { data: perfilAdmin } = await supabaseAuth
        .from('perfiles')
        .select('rol')
        .eq('id', user.id)
        .single()

    if (perfilAdmin?.rol !== 'admin') {
        return { error: 'Solo el administrador puede crear usuarios' }
    }

    // 2. Extraemos los datos del formulario
    const usuario = formData.get('usuario') as string // Ej: apto101
    const nombre = formData.get('nombre') as string   // Ej: Juan Perez
    const password = formData.get('password') as string
    const coeficiente = parseFloat(formData.get('coeficiente') as string)

    const emailFicticio = `${usuario.toLowerCase().trim()}@asamblea.local`

    // 3. Usamos la LLAVE MAESTRA para crear el usuario en Auth sin cerrar nuestra sesión
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: emailFicticio,
        password: password,
        email_confirm: true // Confirmamos el email automáticamente
    })

    if (authError) {
        return { error: 'Error al crear credenciales: ' + authError.message }
    }

    // 4. Guardamos sus datos en la tabla perfiles
    if (authData.user) {
        const { error: perfilError } = await supabaseAdmin.from('perfiles').insert({
            id: authData.user.id,
            usuario: usuario.toLowerCase().trim(),
            nombre: nombre,
            rol: 'propietario',
            coeficiente: coeficiente
        })

        if (perfilError) {
            // Si falla al crear el perfil, borramos el usuario por limpieza
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            return { error: 'Error al guardar el perfil: ' + perfilError.message }
        }
    }

    return { success: true, mensaje: `Propietario ${usuario} creado con éxito` }
}