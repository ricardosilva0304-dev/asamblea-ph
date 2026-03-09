'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function ControlProgramador() {
    const [tituloPregunta, setTituloPregunta] = useState('')
    const [textoMensaje, setTextoMensaje] = useState('')
    const [cargando, setCargando] = useState(false)

    const supabase = createClient()

    // === LÓGICA DE VOTACIONES ===
    const lanzarVotacion = async () => {
        if (!tituloPregunta.trim()) return alert("Escribe una pregunta primero")
        setCargando(true)

        // 1. Cerramos cualquier pregunta que estuviera activa antes
        await supabase.from('preguntas').update({ estado: 'cerrada' }).eq('estado', 'activa')

        // 2. Insertamos la nueva pregunta como 'activa'
        const { error } = await supabase.from('preguntas').insert({
            titulo: tituloPregunta,
            estado: 'activa'
        })

        if (!error) {
            alert("¡Votación lanzada con éxito!")
            setTituloPregunta('') // Limpiamos el campo
        } else {
            alert("Hubo un error al lanzar la votación")
        }
        setCargando(false)
    }

    const cerrarVotacion = async () => {
        setCargando(true)
        await supabase.from('preguntas').update({ estado: 'cerrada' }).eq('estado', 'activa')
        alert("Votación cerrada. Los propietarios ya no pueden votar.")
        setCargando(false)
    }

    // === LÓGICA DE MENSAJES ===
    const publicarMensaje = async () => {
        if (!textoMensaje.trim()) return alert("Escribe un mensaje")
        setCargando(true)

        // Desactivamos mensajes anteriores
        await supabase.from('mensajes').update({ estado: 'inactivo' }).eq('estado', 'activo')

        // Publicamos el nuevo
        const { error } = await supabase.from('mensajes').insert({
            texto: textoMensaje,
            estado: 'activo'
        })

        if (!error) {
            setTextoMensaje('')
        }
        setCargando(false)
    }

    const quitarMensaje = async () => {
        setCargando(true)
        await supabase.from('mensajes').update({ estado: 'inactivo' }).eq('estado', 'activo')
        setCargando(false)
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* TARJETA 1: CONTROL DE VOTACIONES */}
            <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-600">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    📊 Control de Votaciones
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nueva Pregunta
                        </label>
                        <textarea
                            value={tituloPregunta}
                            onChange={(e) => setTituloPregunta(e.target.value)}
                            placeholder="Ej: ¿Aprueba los estados financieros del año anterior?"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={lanzarVotacion} disabled={cargando}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition shadow-md disabled:opacity-50"
                        >
                            🚀 Lanzar Votación
                        </button>
                        <button
                            onClick={cerrarVotacion} disabled={cargando}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition shadow-md disabled:opacity-50"
                        >
                            🛑 Cerrar Actual
                        </button>
                    </div>
                </div>
            </div>

            {/* TARJETA 2: CONTROL DE MENSAJES */}
            <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-yellow-500">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    📢 Anuncios y Mensajes
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Texto del Anuncio
                        </label>
                        <textarea
                            value={textoMensaje}
                            onChange={(e) => setTextoMensaje(e.target.value)}
                            placeholder="Ej: Tendremos un receso de 15 minutos..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={publicarMensaje} disabled={cargando}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition shadow-md disabled:opacity-50"
                        >
                            Emitir Mensaje
                        </button>
                        <button
                            onClick={quitarMensaje} disabled={cargando}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition shadow-md disabled:opacity-50"
                        >
                            Ocultar Mensaje
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}