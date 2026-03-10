'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import TablaDetalleVotos from './TablaDetalleVotos'

type Pregunta = { id: string; titulo: string; descripcion: string; estado: string; opciones: string[] }
type Voto = { pregunta_id: string; opcion: string; coeficiente: number }

interface Resultado {
    name: string
    value: number
    color: string
}

const COLORES = ['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#64748b']

export default function ResultadosAdmin() {
    const [preguntas, setPreguntas] = useState<Pregunta[]>([])
    const [votos, setVotos] = useState<Voto[]>([])
    const supabase = createClient()

    const cargarDatos = async () => {
        const { data: qData } = await supabase.from('preguntas').select('*').order('creada_en', { ascending: false })
        const { data: vData } = await supabase.from('votos').select('pregunta_id, opcion, coeficiente')
        if (qData) setPreguntas(qData)
        if (vData) setVotos(vData)
    }

    useEffect(() => {
        cargarDatos()

        // Canal para escuchar AMBAS tablas
        const canal = supabase.channel('admin-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'votos' }, cargarDatos)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'preguntas' }, cargarDatos)
            .subscribe()

        return () => { supabase.removeChannel(canal) }
    }, [supabase])

    return (
        <div className="space-y-8">
            {preguntas.map((pregunta) => {
                const votosPreg = votos.filter(v => v.pregunta_id === pregunta.id)

                const resultados: Resultado[] = pregunta.opciones.map((opc: string, i: number) => ({
                    name: opc,
                    value: votosPreg.filter(v => v.opcion === opc).reduce((s, v) => s + Number(v.coeficiente), 0),
                    color: COLORES[i % COLORES.length]
                }))

                return (
                    <div key={pregunta.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">{pregunta.titulo}</h2>
                                <p className="text-slate-500 mt-1">{pregunta.descripcion}</p>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${pregunta.estado === 'activa' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                {pregunta.estado}
                            </span>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="h-60 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={resultados} dataKey="value" nameKey="name" innerRadius={65} outerRadius={80} paddingAngle={8} cornerRadius={10}>
                                            {resultados.map((entry: Resultado, i: number) => (
                                                <Cell key={`cell-${i}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-black text-slate-900">{votosPreg.length}</span>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Votos</span>
                                </div>
                            </div>

                            <div className="col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                                {resultados.map((res: Resultado, i: number) => (
                                    <div key={`res-${i}`} className="p-5 rounded-2xl border border-slate-100 bg-slate-50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: res.color }}></div>
                                            <span className="text-xs font-bold text-slate-500 uppercase">{res.name}</span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-900">{res.value.toFixed(1)}%</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <TablaDetalleVotos preguntaId={pregunta.id} />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}