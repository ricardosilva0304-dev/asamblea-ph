'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import TablaDetalleVotos from './TablaDetalleVotos'

type Pregunta = { id: string; titulo: string; estado: string; opciones: string[] }
type Voto = { pregunta_id: string; opcion: string; coeficiente: number }

// Colores consistentes para las opciones
const COLORES = ['#10b981', '#ef4444', '#6366f1', '#f59e0b', '#8b5cf6']

export default function ResultadosAdmin() {
    const [preguntas, setPreguntas] = useState<Pregunta[]>([])
    const [votos, setVotos] = useState<Voto[]>([])
    const supabase = createClient()

    useEffect(() => {
        const cargarDatos = async () => {
            // 1. Cargar todas las encuestas
            const { data: qData } = await supabase.from('preguntas').select('*').order('creada_en', { ascending: false })
            if (qData) setPreguntas(qData)

            // 2. Cargar todos los votos
            const { data: vData } = await supabase.from('votos').select('pregunta_id, opcion, coeficiente')
            if (vData) setVotos(vData)
        }
        cargarDatos()

        // Tiempo Real: Insertar votos
        const canal = supabase.channel('realtime-admin')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votos' }, (payload) => {
                setVotos((prev) => [...prev, payload.new as Voto])
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'preguntas' }, () => {
                // Si cambian las preguntas, recargamos todo para estar seguros
                cargarDatos()
            })
            .subscribe()

        return () => { supabase.removeChannel(canal) }
    }, [supabase])

    return (
        <div className="space-y-12">
            {preguntas.map((pregunta) => {
                const votosPregunta = votos.filter(v => v.pregunta_id === pregunta.id)

                // Calcular resultados dinámicamente
                const resultados = pregunta.opciones.map(opc => ({
                    name: opc,
                    value: votosPregunta.filter(v => v.opcion === opc).reduce((s, v) => s + Number(v.coeficiente), 0)
                }))

                return (
                    <div key={pregunta.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-slate-800">{pregunta.titulo}</h2>
                            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${pregunta.estado === 'activa' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                {pregunta.estado}
                            </span>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-10">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={resultados} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={5} label>
                                            {resultados.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-4">
                                <div className="text-slate-500 text-sm">Total participantes: {votosPregunta.length}</div>
                                {resultados.map((res, i) => (
                                    <div key={res.name} className="flex justify-between border-b pb-2">
                                        <span className="font-bold" style={{ color: COLORES[i % COLORES.length] }}>{res.name}</span>
                                        <span className="font-mono">{res.value.toFixed(2)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t">
                            <h4 className="font-bold mb-4">Detalle de Votos</h4>
                            <TablaDetalleVotos preguntaId={pregunta.id} />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}