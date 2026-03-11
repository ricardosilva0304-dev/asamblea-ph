'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import TablaDetalleVotos from './TablaDetalleVotos'

type Pregunta = { id: string; titulo: string; descripcion: string; estado: string; opciones: string[] }
type Voto = { pregunta_id: string; opcion: string; coeficiente: number }
interface Resultado { name: string; value: number; color: string }

const COLORES = ['#7c3aed', '#ec4899', '#10b981', '#f59e0b', '#64748b']

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
        const canal = supabase.channel('admin-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'votos' }, cargarDatos)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'preguntas' }, cargarDatos)
            .subscribe()
        return () => { supabase.removeChannel(canal) }
    }, [supabase])

    if (preguntas.length === 0) {
        return (
            <div className="ra-empty">
                <div className="ra-empty-icon">🗳️</div>
                <p>No hay encuestas creadas aún</p>
            </div>
        )
    }

    return (
        <>
            <style>{`
        .ra-stack { display: flex; flex-direction: column; gap: 1.25rem; }

        /* ── Card ── */
        .ra-card {
          background: white;
          border: 1px solid #e8ecf2;
          border-radius: 1.5rem;
          padding: 1.75rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          animation: raCardIn 0.35s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes raCardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ra-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .ra-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.2px;
          line-height: 1.25;
        }

        .ra-card-desc {
          font-size: 0.82rem;
          color: #94a3b8;
          margin-top: 3px;
          line-height: 1.45;
        }

        .ra-status-chip {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 4px 12px;
          border-radius: 99px;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }
        .ra-status-active   { background: #f5f3ff; color: #7c3aed; border: 1px solid #ede9fe; }
        .ra-status-inactive { background: #f8fafc; color: #94a3b8; border: 1px solid #e8ecf2; }

        .ra-status-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: currentColor;
        }
        .ra-status-active .ra-status-dot { animation: livePulse 1.8s ease-in-out infinite; }
        @keyframes livePulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:0.4; transform:scale(0.6); }
        }

        /* ── Chart grid ── */
        .ra-viz-grid {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 1.5rem;
          align-items: center;
        }
        @media (max-width: 700px) {
          .ra-viz-grid { grid-template-columns: 1fr; }
        }

        .ra-chart-wrap {
          position: relative;
          height: 200px;
        }

        .ra-chart-center {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .ra-chart-count {
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1;
        }

        .ra-chart-label {
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
          margin-top: 3px;
        }

        /* ── Option cards ── */
        .ra-opts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 0.75rem;
        }

        .ra-opt-card {
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
          background: #f8fafc;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .ra-opt-card:hover { border-color: #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

        .ra-opt-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.5rem;
        }

        .ra-opt-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .ra-opt-name {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ra-opt-value {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1;
        }

        .ra-opt-bar-track {
          height: 3px;
          background: #e8ecf2;
          border-radius: 99px;
          margin-top: 0.5rem;
          overflow: hidden;
        }

        .ra-opt-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.6s cubic-bezier(0.22,1,0.36,1);
        }

        /* ── Divider ── */
        .ra-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 1.5rem 0;
        }

        /* ── Empty ── */
        .ra-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: #94a3b8;
          font-size: 0.9rem;
          background: white;
          border: 1px solid #e8ecf2;
          border-radius: 1.5rem;
        }
        .ra-empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
      `}</style>

            <div className="ra-stack">
                {preguntas.map((pregunta) => {
                    const votosPreg = votos.filter(v => v.pregunta_id === pregunta.id)
                    const isActive = pregunta.estado === 'activa'

                    const resultados: Resultado[] = pregunta.opciones.map((opc, i) => ({
                        name: opc,
                        value: votosPreg.filter(v => v.opcion === opc).reduce((s, v) => s + Number(v.coeficiente), 0),
                        color: COLORES[i % COLORES.length]
                    }))

                    const totalValue = resultados.reduce((s, r) => s + r.value, 0)

                    return (
                        <div key={pregunta.id} className="ra-card">
                            {/* Header */}
                            <div className="ra-card-header">
                                <div>
                                    <div className="ra-card-title">{pregunta.titulo}</div>
                                    {pregunta.descripcion && <p className="ra-card-desc">{pregunta.descripcion}</p>}
                                </div>
                                <span className={`ra-status-chip ${isActive ? 'ra-status-active' : 'ra-status-inactive'}`}>
                                    <span className="ra-status-dot" />
                                    {pregunta.estado}
                                </span>
                            </div>

                            {/* Viz */}
                            <div className="ra-viz-grid">
                                {/* Donut */}
                                <div className="ra-chart-wrap">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={resultados}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={60}
                                                outerRadius={78}
                                                paddingAngle={6}
                                                cornerRadius={8}
                                                startAngle={90}
                                                endAngle={-270}
                                            >
                                                {resultados.map((entry, i) => (
                                                    <Cell key={`cell-${i}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ borderRadius: '10px', border: '1px solid #e8ecf2', fontSize: '0.82rem', fontFamily: 'DM Sans, sans-serif' }}
                                                formatter={(v: any) => [`${Number(v || 0).toFixed(2)}%`, '']}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="ra-chart-center">
                                        <span className="ra-chart-count">{votosPreg.length}</span>
                                        <span className="ra-chart-label">votos</span>
                                    </div>
                                </div>

                                {/* Option cards */}
                                <div className="ra-opts-grid">
                                    {resultados.map((res, i) => (
                                        <div key={i} className="ra-opt-card">
                                            <div className="ra-opt-header">
                                                <div className="ra-opt-dot" style={{ background: res.color }} />
                                                <span className="ra-opt-name">{res.name}</span>
                                            </div>
                                            <div className="ra-opt-value">{res.value.toFixed(1)}%</div>
                                            <div className="ra-opt-bar-track">
                                                <div
                                                    className="ra-opt-bar-fill"
                                                    style={{ width: `${totalValue > 0 ? (res.value / totalValue) * 100 : 0}%`, background: res.color }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tabla detalle */}
                            <div className="ra-divider" />
                            <TablaDetalleVotos preguntaId={pregunta.id} />
                        </div>
                    )
                })}
            </div>
        </>
    )
}