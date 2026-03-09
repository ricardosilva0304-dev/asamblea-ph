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
            alert("Error al lanzar la votación")
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

    // Estilo común para botones
    const btnBase = "flex-1 font-semibold py-3 px-4 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* TARJETA 1: VOTACIONES */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600 text-xl">📊</div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Votaciones</h2>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Control en vivo</p>
                    </div>
                </div>

                <textarea
                    value={tituloPregunta}
                    onChange={(e) => setTituloPregunta(e.target.value)}
                    placeholder="¿Cuál es la pregunta para la asamblea?"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none mb-4 min-h-[120px] text-slate-700"
                />

                <div className="flex gap-3">
                    <button
                        onClick={lanzarVotacion}
                        disabled={cargando}
                        className={`${btnBase} bg-indigo-600 text-white hover:bg-indigo-700`}
                    >
                        {cargando ? 'Procesando...' : '🚀 Lanzar'}
                    </button>
                    <button
                        onClick={cerrarVotacion}
                        disabled={cargando}
                        className={`${btnBase} bg-slate-100 text-slate-700 hover:bg-slate-200`}
                    >
                        🛑 Cerrar
                    </button>
                </div>
            </div>

            {/* TARJETA 2: ANUNCIOS */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-amber-100 p-3 rounded-2xl text-amber-600 text-xl">📢</div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Anuncios</h2>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Mensajes en pantalla</p>
                    </div>
                </div>

                <textarea
                    value={textoMensaje}
                    onChange={(e) => setTextoMensaje(e.target.value)}
                    placeholder="Ej: Receso de 15 minutos..."
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all resize-none mb-4 min-h-[120px] text-slate-700"
                />

                <div className="flex gap-3">
                    <button
                        onClick={publicarMensaje}
                        disabled={cargando}
                        className={`${btnBase} bg-amber-500 text-white hover:bg-amber-600`}
                    >
                        Emitir Anuncio
                    </button>
                    <button
                        onClick={quitarMensaje}
                        disabled={cargando}
                        className={`${btnBase} bg-slate-100 text-slate-700 hover:bg-slate-200`}
                    >
                        Ocultar
                    </button>
                </div>
            </div>

        </div>
    )
}