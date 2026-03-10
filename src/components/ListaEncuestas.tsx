'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Trash2, Edit2, Rocket, Clock, CheckCircle2 } from 'lucide-react'

export default function ListaEncuestas({ onEdit }: { onEdit: (e: any) => void }) {
    const [encuestas, setEncuestas] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        const fetchEncuestas = async () => {
            const { data } = await supabase.from('preguntas').select('*').order('creada_en', { ascending: false })
            if (data) setEncuestas(data)
        }
        fetchEncuestas()

        const canal = supabase.channel('realtime-preguntas')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'preguntas' }, (payload) => {
                if (payload.eventType === 'INSERT') setEncuestas(prev => [payload.new, ...prev])
                if (payload.eventType === 'DELETE') setEncuestas(prev => prev.filter(e => e.id !== payload.old.id))
                if (payload.eventType === 'UPDATE') setEncuestas(prev => prev.map(e => e.id === payload.new.id ? payload.new : e))
            }).subscribe()

        return () => { supabase.removeChannel(canal) }
    }, [supabase])

    const eliminarEncuesta = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta encuesta permanentemente?')) return
        await supabase.from('preguntas').delete().eq('id', id)
    }

    return (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Encuestas Creadas</h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{encuestas.length} Total</span>
            </div>

            <div className="space-y-3">
                {encuestas.map((e) => (
                    <div key={e.id} className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-white hover:shadow-md border border-slate-100 hover:border-indigo-100 rounded-xl transition-all duration-200">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${e.estado === 'activa' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                                {e.estado === 'activa' ? <Rocket size={18} /> : <Clock size={18} />}
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800">{e.titulo}</h4>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{e.estado}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onEdit(e)}
                                className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition"
                                title="Editar"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={() => eliminarEncuesta(e.id)}
                                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                                title="Eliminar"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}