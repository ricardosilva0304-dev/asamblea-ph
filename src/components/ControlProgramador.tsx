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
        await supabase.from('preguntas').update({ estado: 'cerrada' }).eq('estado', 'activa')
        const { error } = await supabase.from('preguntas').insert({ titulo: tituloPregunta, estado: 'activa' })
        if (!error) {
            setTituloPregunta('')
        } else {
            alert("Error al lanzar")
        }
        setCargando(false)
    }

    const cerrarVotacion = async () => {
        setCargando(true)
        await supabase.from('preguntas').update({ estado: 'cerrada' }).eq('estado', 'activa')
        setCargando(false)
    }

    // === LÓGICA DE MENSAJES ===
    const publicarMensaje = async () => {
        if (!textoMensaje.trim()) return alert("Escribe un mensaje")
        setCargando(true)
        await supabase.from('mensajes').update({ estado: 'inactivo' }).eq('estado', 'activo')
        await supabase.from('mensajes').insert({ texto: textoMensaje, estado: 'activo' })
        setTextoMensaje('')
        setCargando(false)
    }

    const quitarMensaje = async () => {
        setCargando(true)
        await supabase.from('mensajes').update({ estado: 'inactivo' }).eq('estado', 'activo')
        setCargando(false)
    }

    // Estilo base para los botones
    const btnBase = "flex-1 font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* TARJETA 1: VOTACIONES */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">📊</div>
                    <h2 className="text-lg font-bold text-slate-800">Control de Votaciones</h2>
                </div>

                <textarea
                    value={tituloPregunta}
                    onChange={(e) => setTituloPregunta(e.target.value)}
                    placeholder="¿Cuál es la pregunta para la asamblea?"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-4"
                    rows={4}
                />

                <div className="flex gap-3">
                    <button onClick={lanzarVotacion} disabled={cargando} className={`${btnBase} bg-emerald-600 text-white hover:bg-emerald-700`}>
                        {cargando ? 'Procesando...' : '🚀 Lanzar'}
                    </button>
                    <button onClick={cerrarVotacion} disabled={cargando} className={`${btnBase} bg-slate-800 text-white hover:bg-black`}>
                        🛑 Cerrar
                    </button>
                </div>
            </div>

            {/* TARJETA 2: ANUNCIOS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-amber-100 p-2 rounded-lg text-amber-600">📢</div>
                    <h2 className="text-lg font-bold text-slate-800">Anuncios en Pantalla</h2>
                </div>

                <textarea
                    value={textoMensaje}
                    onChange={(e) => setTextoMensaje(e.target.value)}
                    placeholder="Ej: Receso de 15 minutos..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none resize-none mb-4"
                    rows={4}
                />

                <div className="flex gap-3">
                    <button onClick={publicarMensaje} disabled={cargando} className={`${btnBase} bg-amber-500 text-white hover:bg-amber-600`}>
                        Emitir Anuncio
                    </button>
                    <button onClick={quitarMensaje} disabled={cargando} className={`${btnBase} bg-slate-200 text-slate-700 hover:bg-slate-300`}>
                        Ocultar
                    </button>
                </div>
            </div>

        </div>
    )
}