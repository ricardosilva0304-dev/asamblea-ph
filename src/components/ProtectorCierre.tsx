'use client'

import { useEffect } from 'react'

export default function ProtectorCierre() {
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            // Mensaje estándar que mostrará el navegador
            event.preventDefault()
            event.returnValue = '' // Requerido para navegadores modernos
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [])

    return null // Este componente no renderiza nada visual, solo ejecuta la lógica
}