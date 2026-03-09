'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { utils, writeFile } from 'xlsx'

type VotoDetallado = {
    usuario: string
    nombre: string
    opcion: string
    coeficiente: number
}

export default function TablaDetalleVotos({ preguntaId }: { preguntaId: string }) {
    const [votos, setVotos] = useState<VotoDetallado[]>([])
    const supabase = createClient()

    useEffect(() => {
        const cargarDetalles = async () => {
            const { data } = await supabase
                .from('votos')
                .select(`
                    opcion,
                    coeficiente,
                    perfiles (usuario, nombre)
                `)
                .eq('pregunta_id', preguntaId)

            if (data) {
                const formateados = data.map((v: any) => ({
                    usuario: v.perfiles.usuario,
                    nombre: v.perfiles.nombre,
                    opcion: v.opcion,
                    coeficiente: v.coeficiente
                }))
                setVotos(formateados)
            }
        }
        cargarDetalles()
    }, [preguntaId, supabase])

    // Función para exportar a Excel
    const exportarExcel = () => {
        if (votos.length === 0) return
        const ws = utils.json_to_sheet(votos)
        const wb = utils.book_new()
        utils.book_append_sheet(wb, ws, "Resultados")
        writeFile(wb, `Votos_Pregunta_${preguntaId.slice(0, 8)}.xlsx`)
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="font-bold text-slate-700 text-lg">Detalle de Votación</h3>
                {votos.length > 0 && (
                    <button
                        onClick={exportarExcel}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        Descargar Excel
                    </button>
                )}
            </div>

            {votos.length === 0 ? (
                <div className="p-10 text-center text-slate-400">No se han registrado votos aún.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest">
                            <tr>
                                <th className="px-6 py-4 text-left">Apto</th>
                                <th className="px-6 py-4 text-left">Nombre</th>
                                <th className="px-6 py-4 text-center">Voto</th>
                                <th className="px-6 py-4 text-right">Coef.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {votos.map((v, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900">{v.usuario}</td>
                                    <td className="px-6 py-4 text-slate-600">{v.nombre}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${v.opcion === 'Si' ? 'bg-green-100 text-green-700' :
                                                v.opcion === 'No' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {v.opcion}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-slate-600">{v.coeficiente.toFixed(2)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}