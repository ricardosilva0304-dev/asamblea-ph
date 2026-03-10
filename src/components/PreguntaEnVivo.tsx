'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

// 1. Agregamos 'opciones' al tipo
type Pregunta = { id: string; titulo: string; estado: string; opciones: string[] }
type Perfil = { id: string; coeficiente: number }

export default function PreguntaEnVivo() {
    const [preguntaActiva, setPreguntaActiva] = useState<Pregunta | null>(null)
    const [perfil, setPerfil] = useState<Perfil | null>(null)
    const [yaVote, setYaVote] = useState(false)
    const [enviando, setEnviando] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        const cargarDatos = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: perfilData } = await supabase.from('perfiles').select('id, coeficiente').eq('id', user.id).single()
            if (perfilData) setPerfil(perfilData)

            // 2. Traemos las opciones de la tabla
            const { data: pregunta } = await supabase.from('preguntas').select('*').eq('estado', 'activa').single()

            if (pregunta) {
                setPreguntaActiva(pregunta)
                const { count } = await supabase.from('votos').select('*', { count: 'exact' })
                    .eq('pregunta_id', pregunta.id).eq('usuario_id', user.id)
                if (count && count > 0) setYaVote(true)
            }
        }

        cargarDatos()

        const canal = supabase.channel('preguntas-propietario')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'preguntas' }, (payload) => {
                const nuevaPregunta = payload.new as Pregunta
                if (nuevaPregunta?.estado === 'activa') {
                    setPreguntaActiva(nuevaPregunta)
                    setYaVote(false)
                } else {
                    setPreguntaActiva(null)
                    setYaVote(false)
                }
            }).subscribe()

        return () => { supabase.removeChannel(canal) }
    }, [supabase])

    // 3. Función dinámica
    const emitirVoto = async (opcion: string) => {
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
            alert("Error al votar.")
        }
        setEnviando(false)
    }

    if (!preguntaActiva) return <div>Esperando votación...</div>

    return (
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-2xl font-black text-slate-900 mb-8">{preguntaActiva.titulo}</h3>

            {yaVote ? (
                <div className="text-center p-8 bg-emerald-50 rounded-3xl">¡Voto enviado!</div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {/* 4. Mapeamos las opciones dinámicamente */}
                    {preguntaActiva.opciones.map((opcion: string) => (
                        <button
                            key={opcion}
                            onClick={() => emitirVoto(opcion)}
                            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition"
                        >
                            {opcion}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}