'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { utils, writeFile } from 'xlsx'
import { Download, UserX, CheckCircle2, Loader2 } from 'lucide-react'

type VotoDetallado = { usuario: string; nombre: string; opcion: string; coeficiente: number }
type Usuario = { id: string; usuario: string; nombre: string; coeficiente: number }

const COLORES_OPCION: Record<string, string> = {
    'Apruebo': '#dcfce7|#15803d',
    'No Apruebo': '#fee2e2|#dc2626',
    'Abstención': '#f1f5f9|#64748b',
}

function chipStyle(opcion: string) {
    const entry = COLORES_OPCION[opcion]
    if (entry) {
        const [bg, color] = entry.split('|')
        return { background: bg, color }
    }
    return { background: '#eff6ff', color: '#1d4ed8' }
}

export default function TablaDetalleVotos({ preguntaId }: { preguntaId: string }) {
    const [votos, setVotos] = useState<VotoDetallado[]>([])
    const [pendientes, setPendientes] = useState<Usuario[]>([])
    const [cargando, setCargando] = useState(true)
    const supabase = createClient()

    const cargarDatos = useCallback(async () => {
        const { data: dataVotos } = await supabase
            .from('votos')
            .select(`opcion, coeficiente, perfiles (usuario, nombre)`)
            .eq('pregunta_id', preguntaId)

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
            const yaVotaron = dataVotos.map((v: any) => v.perfiles?.usuario)
            const sinVotar = dataUsuarios.filter(u => !yaVotaron.includes(u.usuario))
            setVotos(votosFormateados)
            setPendientes(sinVotar)
        }
        setCargando(false)
    }, [preguntaId, supabase])

    useEffect(() => {
        cargarDatos()
        const canal = supabase.channel(`votos-detalle-${preguntaId}`)
            .on('postgres_changes', {
                event: 'INSERT', schema: 'public', table: 'votos',
                filter: `pregunta_id=eq.${preguntaId}`
            }, cargarDatos)
            .subscribe()
        return () => { supabase.removeChannel(canal) }
    }, [preguntaId, cargarDatos, supabase])

    const exportarExcel = () => {
        if (votos.length === 0) return
        const ws = utils.json_to_sheet(votos)
        const wb = utils.book_new()
        utils.book_append_sheet(wb, ws, 'Resultados')
        writeFile(wb, `Votos_${preguntaId.slice(0, 8)}.xlsx`)
    }

    if (cargando) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: '#94a3b8' }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
    )

    return (
        <>
            <style>{`
        .tdv-wrap { display: flex; flex-direction: column; gap: 1rem; }

        /* ── Panel ── */
        .tdv-panel {
          border: 1px solid #e8ecf2;
          border-radius: 1rem;
          overflow: hidden;
          background: white;
        }

        .tdv-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.9rem 1.1rem;
          border-bottom: 1px solid #f1f5f9;
          gap: 0.75rem;
        }

        .tdv-header-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.82rem;
          font-weight: 700;
          color: #334155;
        }

        .tdv-header-icon-green { color: #16a34a; }
        .tdv-header-icon-red   { color: #dc2626; }

        .tdv-count-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 99px;
          background: #f1f5f9;
          color: #64748b;
          letter-spacing: 0.04em;
        }

        .tdv-export-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 5px 12px;
          border-radius: 8px;
          border: 1px solid #bbf7d0;
          background: #f0fdf4;
          color: #15803d;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .tdv-export-btn:hover { background: #dcfce7; }

        /* ── Table ── */
        .tdv-table-wrap { overflow-x: auto; }

        .tdv-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.83rem;
        }

        .tdv-table th {
          text-align: left;
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
          padding: 0.6rem 1rem;
          background: #f8fafc;
          border-bottom: 1px solid #f1f5f9;
        }

        .tdv-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f8fafc;
          vertical-align: middle;
        }

        .tdv-table tr:last-child td { border-bottom: none; }
        .tdv-table tr:hover td { background: #fafbfd; }

        .tdv-unit-cell {
          font-weight: 700;
          color: #0f172a;
          font-size: 0.82rem;
        }

        .tdv-name-cell {
          color: #64748b;
          font-size: 0.8rem;
        }

        .tdv-opcion-chip {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        .tdv-coef {
          font-family: 'Courier New', monospace;
          font-weight: 700;
          font-size: 0.8rem;
          color: #334155;
          text-align: right;
        }

        /* ── Empty ── */
        .tdv-empty {
          padding: 2rem 1rem;
          text-align: center;
          font-size: 0.82rem;
        }
        .tdv-empty-waiting { color: #94a3b8; font-style: italic; }
        .tdv-empty-all     { color: #16a34a; font-weight: 700; }

        /* ── Pending grid ── */
        .tdv-pending-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.5rem;
          padding: 0.9rem 1rem;
        }

        .tdv-pending-item {
          padding: 0.6rem 0.75rem;
          border-radius: 9px;
          background: #fef2f2;
          border: 1px solid #fee2e2;
        }

        .tdv-pending-unit {
          font-size: 0.75rem;
          font-weight: 700;
          color: #0f172a;
        }

        .tdv-pending-name {
          font-size: 0.67rem;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 1px;
        }

        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

            <div className="tdv-wrap">
                {/* VOTANTES */}
                <div className="tdv-panel">
                    <div className="tdv-panel-header">
                        <div className="tdv-header-left">
                            <CheckCircle2 size={16} className="tdv-header-icon-green" />
                            Votantes registrados
                            <span className="tdv-count-badge">{votos.length}</span>
                        </div>
                        <button className="tdv-export-btn" onClick={exportarExcel}>
                            <Download size={12} /> Exportar
                        </button>
                    </div>

                    {votos.length === 0 ? (
                        <div className="tdv-empty tdv-empty-waiting">Esperando el primer voto…</div>
                    ) : (
                        <div className="tdv-table-wrap">
                            <table className="tdv-table">
                                <thead>
                                    <tr>
                                        <th>Unidad</th>
                                        <th>Nombre</th>
                                        <th style={{ textAlign: 'center' }}>Voto</th>
                                        <th style={{ textAlign: 'right' }}>Coef.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {votos.map((v, i) => (
                                        <tr key={i}>
                                            <td className="tdv-unit-cell">{v.usuario}</td>
                                            <td className="tdv-name-cell">{v.nombre}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="tdv-opcion-chip" style={chipStyle(v.opcion)}>
                                                    {v.opcion}
                                                </span>
                                            </td>
                                            <td className="tdv-coef">{v.coeficiente.toFixed(2)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* PENDIENTES */}
                <div className="tdv-panel">
                    <div className="tdv-panel-header">
                        <div className="tdv-header-left">
                            <UserX size={16} className="tdv-header-icon-red" />
                            Pendientes de votar
                            <span className="tdv-count-badge">{pendientes.length}</span>
                        </div>
                    </div>

                    {pendientes.length === 0 ? (
                        <div className="tdv-empty tdv-empty-all">🎉 ¡Todos los propietarios han votado!</div>
                    ) : (
                        <div className="tdv-pending-grid">
                            {pendientes.map(p => (
                                <div key={p.id} className="tdv-pending-item">
                                    <div className="tdv-pending-unit">{p.usuario}</div>
                                    <div className="tdv-pending-name">{p.nombre}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}