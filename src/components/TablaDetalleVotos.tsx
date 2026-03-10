'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { utils, writeFile } from 'xlsx'
import { Download, UserX, CheckCircle2 } from 'lucide-react'

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

    // Usamos useCallback para poder llamar a esta función desde el useEffect y desde el Realtime
    const cargarDatos = useCallback(async () => {
        // 1. Cargar Votos
        const { data: dataVotos } = await supabase
            .from('votos')
            .select(`opcion, coeficiente, perfiles (usuario, nombre)`)
            .eq('pregunta_id', preguntaId)

        // 2. Cargar Todos los Usuarios (Propietarios)
        const { data: dataUsuarios } = await supabase
            .from('perfiles')
            .select('id, usuario, nombre, coeficiente')
            .eq('rol', 'propietario')

        if (dataVotos && dataUsuarios) {
            const votosFormateados = dataVotos.map((v: any) => ({
                usuario: v.perfiles?.usuario || 'N/A',
                nombre: v.perfiles?.nombre || 'Desconocido',
                opcion: v.opcion,
                coeficiente: v.coeficiente
            }))

            // Calculamos quiénes faltan por votar comparando las listas
            const usuariosQueYaVotaron = dataVotos.map((v: any) => v.perfiles?.usuario)
            const pendientesFiltrados = dataUsuarios.filter(u => !usuariosQueYaVotaron.includes(u.usuario))

            setVotos(votosFormateados)
            setPendientes(pendientesFiltrados)
        }
    }, [preguntaId, supabase])

    useEffect(() => {
        cargarDatos()

        // === TIEMPO REAL PARA VOTOS ===
        // Escuchamos cualquier INSERT en la tabla de votos para esta pregunta específica
        const canal = supabase.channel(`votos-detalle-${preguntaId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'votos',
                    filter: `pregunta_id=eq.${preguntaId}`
                },
                () => {
                    console.log("Nuevo voto detectado, actualizando listas...")
                    cargarDatos() // Recargamos las listas automáticamente
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(canal)
        }
    }, [preguntaId, cargarDatos, supabase])

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
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        Votantes registrados ({votos.length})
                    </h3>
                    <button onClick={exportarExcel} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-sm">
                        <Download size={14} /> Exportar
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest font-black">
                            <tr>
                                <th className="px-6 py-4 text-left">Unidad</th>
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
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                            {v.opcion}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">{v.coeficiente.toFixed(2)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {votos.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm italic">
                        Esperando el primer voto...
                    </div>
                )}
            </div>

            {/* TABLA DE PENDIENTES */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-white">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <UserX size={18} className="text-rose-500" />
                        Pendientes de votar ({pendientes.length})
                    </h3>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {pendientes.map((p) => (
                        <div key={p.id} className="flex flex-col p-3 bg-slate-50 border border-slate-100 rounded-xl">
                            <span className="text-xs font-black text-slate-900">{p.usuario}</span>
                            <span className="text-[10px] text-slate-500 truncate">{p.nombre}</span>
                        </div>
                    ))}
                </div>
                {pendientes.length === 0 && (
                    <div className="p-6 text-center text-emerald-600 text-sm font-bold">
                        ¡Todos los propietarios han votado!
                    </div>
                )}
            </div>
        </div>
    )
}