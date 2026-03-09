'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import TablaDetalleVotos from './TablaDetalleVotos'

type Pregunta = { id: string; titulo: string; estado: string }
type Voto = { opcion: string; coeficiente: number }

const COLORES = {
    'Si': '#10b981', // Emerald 500
    'No': '#ef4444', // Red 500
    'Abstencion': '#64748b' // Slate 500
}

export default function ResultadosAdmin() {
    const [preguntaActiva, setPreguntaActiva] = useState<Pregunta | null>(null)
    const [votos, setVotos] = useState<Voto[]>([])
    const supabase = createClient()

    // Función unificada para cargar datos
    const cargarVotos = async (id: string) => {
        const { data } = await supabase.from('votos').select('opcion, coeficiente').eq('pregunta_id', id)
        if (data) setVotos(data)
    }

    useEffect(() => {
        // 1. Cargar pregunta inicial
        const init = async () => {
            const { data } = await supabase.from('preguntas').select('*').neq('estado', 'borrador').order('creada_en', { ascending: false }).limit(1).single()
            if (data) {
                setPreguntaActiva(data)
                cargarVotos(data.id)
            }
        }
        init()

        // 2. Realtime Votos
        const canalVotos = supabase.channel('votos-admin')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votos' }, (payload) => {
                setVotos((prev) => [...prev, payload.new as Voto])
            }).subscribe()

        // 3. Realtime Preguntas
        const canalPreguntas = supabase.channel('preguntas-admin')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'preguntas' }, (payload) => {
                const nueva = payload.new as Pregunta
                setPreguntaActiva(nueva)
                if (nueva.estado === 'activa') {
                    setVotos([])
                } else {
                    cargarVotos(nueva.id)
                }
            }).subscribe()

        return () => { supabase.removeChannel(canalVotos); supabase.removeChannel(canalPreguntas) }
    }, [supabase])

    const resultadosCalculados = [
        { name: 'Si', value: votos.filter(v => v.opcion === 'Si').reduce((s, v) => s + Number(v.coeficiente), 0) },
        { name: 'No', value: votos.filter(v => v.opcion === 'No').reduce((s, v) => s + Number(v.coeficiente), 0) },
        { name: 'Abstencion', value: votos.filter(v => v.opcion === 'Abstencion').reduce((s, v) => s + Number(v.coeficiente), 0) }
    ].filter(r => r.value > 0)

    const totalVotos = votos.length
    const totalCoeficiente = resultadosCalculados.reduce((sum, item) => sum + item.value, 0)

    if (!preguntaActiva) return <div className="text-center p-12 text-slate-400 italic">No hay votaciones registradas.</div>

    return (
        <div className="space-y-6">
            {/* Card Principal */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">{preguntaActiva.titulo}</h2>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${preguntaActiva.estado === 'activa' ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
                        {preguntaActiva.estado === 'activa' ? '● En curso' : 'Cerrada'}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="h-64">
                        {totalVotos === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-2xl">Esperando primeros votos...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={resultadosCalculados} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={5} label={(props: any) => `${props.name} ${((props.percent || 0) * 100).toFixed(0)}%`}>
                                        {resultadosCalculados.map((e, i) => <Cell key={i} fill={COLORES[e.name as keyof typeof COLORES]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v: any) => [`${Number(v).toFixed(2)}%`, 'Coeficiente']} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-slate-500 text-xs font-bold uppercase">Votos</p>
                                <p className="text-2xl font-black text-slate-800">{totalVotos}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-slate-500 text-xs font-bold uppercase">Quórum</p>
                                <p className="text-2xl font-black text-slate-800">{totalCoeficiente.toFixed(1)}%</p>
                            </div>
                        </div>
                        {/* Indicadores simples */}
                        {resultadosCalculados.map((res) => (
                            <div key={res.name} className="flex items-center justify-between p-3 border-b border-slate-100">
                                <span className="font-bold text-slate-700">{res.name}</span>
                                <span className="font-mono font-bold text-lg">{res.value.toFixed(2)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabla Detallada */}
            <TablaDetalleVotos preguntaId={preguntaActiva.id} />
        </div>
    )
}