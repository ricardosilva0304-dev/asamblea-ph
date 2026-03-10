'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Trash2, Edit2 } from 'lucide-react'

export default function ListaEncuestas({ onEdit }: { onEdit: (e: any) => void }) {
    const [encuestas, setEncuestas] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('preguntas').select('*').order('creada_en', { ascending: false })
            if (data) setEncuestas(data)
        }
        fetch()

        // TIEMPO REAL: Escuchar cambios en la tabla
        const canal = supabase.channel('realtime-preguntas')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'preguntas' }, (payload) => {
                if (payload.eventType === 'INSERT') setEncuestas(prev => [payload.new, ...prev])
                if (payload.eventType === 'DELETE') setEncuestas(prev => prev.filter(e => e.id !== payload.old.id))
                if (payload.eventType === 'UPDATE') setEncuestas(prev => prev.map(e => e.id === payload.new.id ? payload.new : e))
            }).subscribe()

        return () => { supabase.removeChannel(canal) }
    }, [supabase])

    return (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold mb-6">Encuestas Creadas</h3>
            <div className="space-y-3">
                {encuestas.map((e) => (
                    <div key={e.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                        <span className="font-medium">{e.titulo}</span>
                        <div className="flex gap-3">
                            <button onClick={() => onEdit(e)}><Edit2 size={16} /></button>
                            <button onClick={() => supabase.from('preguntas').delete().eq('id', e.id)}><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}