'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

type Pregunta = { id: string; titulo: string; estado: string }
type Voto = { opcion: string; coeficiente: number }

const COLORES = {
    'Si': '#22c55e', // Verde
    'No': '#ef4444', // Rojo
    'Abstencion': '#6b7280' // Gris
}

export default function ResultadosAdmin() {
    const [preguntaActiva, setPreguntaActiva] = useState<Pregunta | null>(null)
    const [votos, setVotos] = useState<Voto[]>([])
    const supabase = createClient()

    useEffect(() => {
        // 1. Cargar la pregunta activa y sus votos actuales
        const cargarVotos = async () => {
            const { data: pregunta } = await supabase.from('preguntas').select('*').neq('estado', 'borrador').order('creada_en', { ascending: false }).limit(1).single()

            if (pregunta) {
                setPreguntaActiva(pregunta)
                const { data: votosData } = await supabase.from('votos').select('opcion, coeficiente').eq('pregunta_id', pregunta.id)
                if (votosData) setVotos(votosData)
            }
        }
        cargarVotos()

        // 2. Escuchar votos en tiempo real
        const canalVotos = supabase.channel('votos-admin')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votos' }, (payload) => {
                const nuevoVoto = payload.new as Voto
                setVotos((prev) => [...prev, nuevoVoto])
            }).subscribe()

        // 3. Escuchar cambios de preguntas
        const canalPreguntas = supabase.channel('preguntas-admin')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'preguntas' }, (payload) => {
                const nueva = payload.new as Pregunta
                setPreguntaActiva(nueva)
                if (nueva.estado === 'activa') setVotos([]) // Limpiar votos si hay una nueva
            }).subscribe()

        return () => {
            supabase.removeChannel(canalVotos)
            supabase.removeChannel(canalPreguntas)
        }
    }, [supabase])

    // === PROCESAR DATOS PARA EL GRÁFICO ===
    // Agrupamos los votos sumando sus coeficientes
    const resultadosCalculados = [
        { name: 'Si', value: votos.filter(v => v.opcion === 'Si').reduce((sum, v) => sum + Number(v.coeficiente), 0) },
        { name: 'No', value: votos.filter(v => v.opcion === 'No').reduce((sum, v) => sum + Number(v.coeficiente), 0) },
        { name: 'Abstencion', value: votos.filter(v => v.opcion === 'Abstencion').reduce((sum, v) => sum + Number(v.coeficiente), 0) }
    ].filter(r => r.value > 0) // Ocultar los que tienen 0

    const totalVotos = votos.length
    const totalCoeficiente = resultadosCalculados.reduce((sum, item) => sum + item.value, 0)

    if (!preguntaActiva) return <p className="text-gray-500">No hay votaciones recientes...</p>

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">{preguntaActiva.titulo}</h2>
                <span className={`px-4 py-1 rounded-full text-sm font-bold ${preguntaActiva.estado === 'activa' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {preguntaActiva.estado === 'activa' ? '🔴 EN CURSO' : 'CERRADA'}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Gráfico */}
                <div className="h-72">
                    {totalVotos === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400">Esperando votos...</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={resultadosCalculados}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={(props: any) => `${props.name} ${((props.percent || 0) * 100).toFixed(1)}%`}
                                >
                                    {resultadosCalculados.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORES[entry.name as keyof typeof COLORES]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: any) => `Coeficiente: ${Number(value).toFixed(2)}%`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Resumen en texto */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 text-gray-700">Resumen de Votación</h3>
                    <div className="space-y-3">
                        <p className="flex justify-between border-b pb-2"><span className="text-gray-600">Total Votos Emitidos:</span> <span className="font-bold">{totalVotos} propietarios</span></p>
                        <p className="flex justify-between border-b pb-2"><span className="text-gray-600">Quórum Representado:</span> <span className="font-bold">{totalCoeficiente.toFixed(2)}%</span></p>

                        <div className="mt-4 pt-2">
                            <p className="flex justify-between text-green-600"><span className="font-bold">Sí:</span> <span>{resultadosCalculados.find(r => r.name === 'Si')?.value.toFixed(2) || 0}%</span></p>
                            <p className="flex justify-between text-red-600"><span className="font-bold">No:</span> <span>{resultadosCalculados.find(r => r.name === 'No')?.value.toFixed(2) || 0}%</span></p>
                            <p className="flex justify-between text-gray-600"><span className="font-bold">Abstención:</span> <span>{resultadosCalculados.find(r => r.name === 'Abstencion')?.value.toFixed(2) || 0}%</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}