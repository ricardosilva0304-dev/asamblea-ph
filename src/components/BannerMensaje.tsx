'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

type Mensaje = { texto: string; estado: string }

export default function BannerMensaje() {
    const [mensajeActivo, setMensajeActivo] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        // 1. Buscar si ya hay un mensaje activo al cargar
        const cargarMensaje = async () => {
            const { data } = await supabase
                .from('mensajes')
                .select('*')
                .eq('estado', 'activo')
                .order('creado_en', { ascending: false })
                .limit(1)
                .single()

            if (data) setMensajeActivo(data.texto)
        }
        cargarMensaje()

        // 2. Escuchar cambios en los mensajes
        const canal = supabase.channel('mensajes-en-vivo')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'mensajes' }, (payload) => {
                const nuevoMensaje = payload.new as Mensaje

                if (nuevoMensaje.estado === 'activo') {
                    setMensajeActivo(nuevoMensaje.texto)
                } else {
                    setMensajeActivo(null) // Se oculta si el estado pasa a 'inactivo'
                }
            }).subscribe()

        return () => { supabase.removeChannel(canal) }
    }, [supabase])

    if (!mensajeActivo) return null

    return (
        <div className="bg-white border-l-4 border-slate-900 p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Anuncio Activo</p>
                <p className="text-slate-800 font-medium text-lg">{mensajeActivo}</p>
            </div>
        </div>
    )
}