'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Bell, Megaphone } from 'lucide-react'

type Mensaje = { texto: string; estado: string }

export default function BannerMensaje() {
    const [mensajeActivo, setMensajeActivo] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
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

        const canal = supabase.channel('mensajes-en-vivo')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'mensajes' }, (payload) => {
                const nuevoMensaje = payload.new as Mensaje
                if (nuevoMensaje.estado === 'activo') {
                    setMensajeActivo(nuevoMensaje.texto)
                } else {
                    setMensajeActivo(null)
                }
            }).subscribe()

        return () => { supabase.removeChannel(canal) }
    }, [supabase])

    if (!mensajeActivo) return null

    return (
        <div className="relative overflow-hidden bg-white rounded-2xl border border-indigo-100 shadow-[0_4px_20px_-4px_rgba(79,70,229,0.1)] p-1 animate-in slide-in-from-top-4 duration-500">
            {/* Franja decorativa lateral */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-l-2xl"></div>

            <div className="flex items-center gap-4 px-6 py-4">
                {/* Icono con fondo llamativo */}
                <div className="flex-shrink-0 bg-indigo-50 p-3 rounded-xl text-indigo-600">
                    <Megaphone size={22} strokeWidth={2.5} />
                </div>

                {/* Contenido */}
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-0.5">
                        Aviso Importante
                    </span>
                    <p className="text-slate-800 font-semibold leading-snug">
                        {mensajeActivo}
                    </p>
                </div>
            </div>

            {/* Pequeño detalle de pulso para indicar actividad */}
            <div className="absolute right-4 top-4">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
            </div>
        </div>
    )
}