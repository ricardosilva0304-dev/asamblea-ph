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
    if (!preguntaActiva) {
        return (
            <div className="p-8 bg-white border rounded-xl text-center shadow-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500 text-lg">Esperando la próxima votación...</p>
            </div>
        )
    }

    return (
        <div className="p-8 bg-white border-2 border-blue-500 rounded-xl shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
                <h2 className="text-red-600 font-bold uppercase text-sm tracking-widest">Votación en Curso</h2>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-8">{preguntaActiva.titulo}</h3>

            {yaVote ? (
                <div className="p-6 bg-green-50 text-green-700 border border-green-200 rounded-lg text-center">
                    <svg className="w-12 h-12 mx-auto mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <p className="text-xl font-bold">¡Tu voto ha sido registrado!</p>
                    <p className="text-sm mt-2 opacity-80">Espera a que el administrador cierre la votación.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button disabled={enviando} onClick={() => emitirVoto('Si')} className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl text-xl transition-transform hover:scale-105 shadow-md disabled:opacity-50">
                        SÍ
                    </button>
                    <button disabled={enviando} onClick={() => emitirVoto('No')} className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl text-xl transition-transform hover:scale-105 shadow-md disabled:opacity-50">
                        NO
                    </button>
                    <button disabled={enviando} onClick={() => emitirVoto('Abstencion')} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 rounded-xl text-xl transition-transform hover:scale-105 shadow-md disabled:opacity-50">
                        ABSTENCIÓN
                    </button>
                </div>
            )}
        </div>
    )
}