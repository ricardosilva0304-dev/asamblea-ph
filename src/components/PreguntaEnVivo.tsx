'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

type Pregunta = { id: string; titulo: string; estado: string }
type Perfil = { id: string; coeficiente: number }

export default function PreguntaEnVivo() {
    const [preguntaActiva, setPreguntaActiva] = useState<Pregunta | null>(null)
    const [perfil, setPerfil] = useState<Perfil | null>(null)
    const [yaVote, setYaVote] = useState(false)
    const [enviando, setEnviando] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        // 1. Cargar datos iniciales
        const cargarDatos = async () => {
            // Obtener quién soy yo
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Obtener mi coeficiente
            const { data: perfilData } = await supabase.from('perfiles').select('id, coeficiente').eq('id', user.id).single()
            if (perfilData) setPerfil(perfilData)

            // Obtener pregunta activa
            const { data: pregunta } = await supabase.from('preguntas').select('*').eq('estado', 'activa').single()

            if (pregunta) {
                setPreguntaActiva(pregunta)
                // Revisar si ya había votado en esta pregunta (por si recarga la página)
                const { count } = await supabase.from('votos').select('*', { count: 'exact' })
                    .eq('pregunta_id', pregunta.id).eq('usuario_id', user.id)
                if (count && count > 0) setYaVote(true)
            }
        }

        cargarDatos()

        // 2. Escuchar cambios de la pregunta (por si el programador la cierra o cambia)
        const canal = supabase.channel('preguntas-propietario')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'preguntas' }, (payload) => {
                const nuevaPregunta = payload.new as Pregunta
                if (nuevaPregunta.estado === 'activa') {
                    setPreguntaActiva(nuevaPregunta)
                    setYaVote(false) // Resetear voto para la nueva pregunta
                } else {
                    setPreguntaActiva(null)
                    setYaVote(false)
                }
            }).subscribe()

        return () => { supabase.removeChannel(canal) }
    }, [supabase])

    // 3. Función para emitir el voto
    const emitirVoto = async (opcion: 'Si' | 'No' | 'Abstencion') => {
        if (!preguntaActiva || !perfil || yaVote) return
        setEnviando(true)

        const { error } = await supabase.from('votos').insert({
            pregunta_id: preguntaActiva.id,
            usuario_id: perfil.id,
            opcion: opcion,
            coeficiente: perfil.coeficiente
        })

        if (!error) {
            setYaVote(true)
        } else {
            alert("Hubo un error o ya habías votado.")
        }
        setEnviando(false)
    }

    // === RENDERIZADO VISUAL ===
    const botonBase = "flex-1 py-6 text-xl font-black rounded-2xl transition-all active:scale-95 shadow-lg border-b-4"

    if (!preguntaActiva) {
        return (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">⏳</span>
                </div>
                <h3 className="text-lg font-bold text-slate-700">Esperando votación</h3>
                <p className="text-slate-400 text-sm mt-2">La administración activará una pregunta pronto.</p>
            </div>
        )
    }

    return (
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 relative overflow-hidden">
            {/* Fondo decorativo sutil */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[4rem] -z-0"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                    <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                    <span className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em]">Votación Activa</span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-8 leading-snug">{preguntaActiva.titulo}</h3>

                {yaVote ? (
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-8 rounded-3xl text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <span className="text-3xl">🗳️</span>
                        </div>
                        <p className="text-emerald-900 font-black text-xl">¡Voto enviado!</p>
                        <p className="text-emerald-700/70 font-medium mt-1">Gracias por participar.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        <button onClick={() => emitirVoto('Si')} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg">SÍ APRUEBO</button>
                        <button onClick={() => emitirVoto('No')} className="w-full bg-white text-slate-800 font-black py-5 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 active:scale-[0.98] transition-all text-lg">NO APRUEBO</button>
                        <button onClick={() => emitirVoto('Abstencion')} className="w-full text-slate-400 font-bold py-3 rounded-2xl hover:bg-slate-50 transition-all">Abstención</button>
                    </div>
                )}
            </div>
        </div>
    )
}