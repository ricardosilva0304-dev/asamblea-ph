'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { utils, writeFile } from 'xlsx'
import { Download, Users, UserX, CheckCircle2 } from 'lucide-react'

type VotoDetallado = {
    usuario: string
    nombre: string
    opcion: string
    coeficiente: number
}

type Usuario = {
    id: string
    usuario: string
    nombre: string
    coeficiente: number
}

export default function TablaDetalleVotos({ preguntaId }: { preguntaId: string }) {
    const [votos, setVotos] = useState<VotoDetallado[]>([])
    const [pendientes, setPendientes] = useState<Usuario[]>([])
    const supabase = createClient()

    useEffect(() => {
        const cargarDatos = async () => {
            // 1. Cargar Votos
            const { data: dataVotos } = await supabase
                .from('votos')
                .select(`opcion, coeficiente, perfiles (usuario, nombre)`)
                .eq('pregunta_id', preguntaId)

            // 2. Cargar Todos los Usuarios
            const { data: dataUsuarios } = await supabase
                .from('perfiles')
                .select('id, usuario, nombre, coeficiente')
                .eq('rol', 'propietario') // Solo comparamos con propietarios

            if (dataVotos && dataUsuarios) {
                const votosFormateados = dataVotos.map((v: any) => ({
                    usuario: v.perfiles.usuario,
                    nombre: v.perfiles.nombre,
                    opcion: v.opcion,
                    coeficiente: v.coeficiente
                }))

                // Calcular pendientes
                const idsVotantes = dataVotos.map((v: any) => v.perfiles?.usuario)
                const pendientesFiltrados = dataUsuarios.filter(u => !idsVotantes.includes(u.usuario))

                setVotos(votosFormateados)
                setPendientes(pendientesFiltrados)
            }
        }
        cargarDatos()
    }, [preguntaId, supabase])

    const exportarExcel = () => {
        if (votos.length === 0) return
        const ws = utils.json_to_sheet(votos)
        const wb = utils.book_new()
        utils.book_append_sheet(wb, ws, "Resultados")
        writeFile(wb, `Votos_Pregunta_${preguntaId.slice(0, 8)}.xlsx`)
    }

    return (
        <div className="space-y-6">
            {/* TABLA DE VOTANTES */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-500" /> Votantes ({votos.length})
                    </h3>
                    <button onClick={exportarExcel} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition">
                        <Download size={14} /> Exportar Excel
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest">
                            <tr>
                                <th className="px-6 py-4 text-left">Unidad</th>
                                <th className="px-6 py-4 text-left">Nombre</th>
                                <th className="px-6 py-4 text-center">Voto</th>
                                <th className="px-6 py-4 text-right">Coef.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {votos.map((v, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-bold text-slate-900">{v.usuario}</td>
                                    <td className="px-6 py-4 text-slate-600">{v.nombre}</td>
                                    <td className="px-6 py-4 text-center"><span className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-bold">{v.opcion}</span></td>
                                    <td className="px-6 py-4 text-right font-mono">{v.coeficiente.toFixed(2)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* TABLA DE PENDIENTES */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-white">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <UserX size={18} className="text-rose-500" /> Pendientes de votar ({pendientes.length})
                    </h3>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {pendientes.map((p) => (
                        <div key={p.id} className="text-xs p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-600">
                            <strong>{p.usuario}</strong> - {p.nombre}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}