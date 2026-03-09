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
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-6">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                </span>
                <span className="text-red-600 font-bold text-xs uppercase tracking-widest">En vivo ahora</span>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-8 leading-tight">{preguntaActiva.titulo}</h3>

            {yaVote ? (
                <div className="bg-emerald-50 border-2 border-emerald-200 p-6 rounded-2xl text-center">
                    <span className="text-4xl mb-2 block">✅</span>
                    <p className="text-emerald-800 font-bold text-lg">¡Voto registrado!</p>
                    <p className="text-emerald-600 text-sm">Gracias por participar.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <button onClick={() => emitirVoto('Si')} className={`${botonBase} bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-600`}>
                        SÍ APRUEBO
                    </button>
                    <button onClick={() => emitirVoto('No')} className={`${botonBase} bg-red-500 border-red-700 text-white hover:bg-red-600`}>
                        NO APRUEBO
                    </button>
                    <button onClick={() => emitirVoto('Abstencion')} className={`${botonBase} bg-slate-500 border-slate-700 text-white hover:bg-slate-600`}>
                        ABSTENCIÓN
                    </button>
                </div>
            )}
        </div>
    )
}