import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    // Ejecutamos nuestra función de seguridad
    return await updateSession(request)
}

// Configuración de en qué rutas se debe ejecutar el middleware
export const config = {
    matcher: [
        /*
         * Ejecutar en todas las rutas EXCEPTO:
         * - Archivos estáticos (_next/static, _next/image, favicon.ico)
         * - Archivos con extensiones (imágenes, fuentes, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}