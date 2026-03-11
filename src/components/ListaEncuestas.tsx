'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Trash2, Edit2, Rocket, Clock, CheckCircle2 } from 'lucide-react'

export default function ListaEncuestas({ onEdit }: { onEdit: (e: any) => void }) {
    const [encuestas, setEncuestas] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        const fetchEncuestas = async () => {
            const { data } = await supabase.from('preguntas').select('*').order('creada_en', { ascending: false })
            if (data) setEncuestas(data)
        }
        fetchEncuestas()

        const canal = supabase.channel('realtime-preguntas')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'preguntas' }, (payload) => {
                if (payload.eventType === 'INSERT') setEncuestas(prev => [payload.new, ...prev])
                if (payload.eventType === 'DELETE') setEncuestas(prev => prev.filter(e => e.id !== payload.old.id))
                if (payload.eventType === 'UPDATE') setEncuestas(prev => prev.map(e => e.id === payload.new.id ? payload.new : e))
            }).subscribe()

        return () => { supabase.removeChannel(canal) }
    }, [supabase])

    const eliminarEncuesta = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta encuesta permanentemente?')) return
        await supabase.from('preguntas').delete().eq('id', id)
    }

    const activas = encuestas.filter(e => e.estado === 'activa')
    const cerradas = encuestas.filter(e => e.estado !== 'activa')

    return (
        <>
            <style>{`
        .le-card {
          background: white;
          border: 1px solid #e8ecf2;
          border-radius: 1.5rem;
          padding: 1.75rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .le-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .le-title-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .le-title-icon {
          width: 34px; height: 34px;
          border-radius: 9px;
          background: #eff6ff;
          color: #2563eb;
          display: flex; align-items: center; justify-content: center;
        }

        .le-title {
          font-family: 'Syne', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.1px;
        }

        .le-count {
          font-size: 0.72rem;
          font-weight: 700;
          background: #f1f5f9;
          color: #64748b;
          padding: 3px 10px;
          border-radius: 99px;
          letter-spacing: 0.04em;
        }

        /* ── Section label ── */
        .le-section-label {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
          margin: 1.1rem 0 0.5rem;
          padding-left: 0.25rem;
        }

        /* ── Row ── */
        .le-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0.9rem;
          border-radius: 10px;
          border: 1px solid transparent;
          transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
          gap: 0.75rem;
        }

        .le-row:hover {
          background: #f8fafc;
          border-color: #e8ecf2;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }

        .le-row-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
        }

        /* Status icon */
        .le-status-icon {
          width: 34px; height: 34px;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .le-status-active   { background: #eff6ff; color: #2563eb; }
        .le-status-inactive { background: #f1f5f9; color: #94a3b8; }
        .le-status-done     { background: #f0fdf4; color: #16a34a; }

        .le-row-title {
          font-size: 0.88rem;
          font-weight: 600;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .le-status-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 2px 8px;
          border-radius: 99px;
          margin-top: 2px;
          width: fit-content;
        }
        .le-chip-active   { background: #dbeafe; color: #1d4ed8; }
        .le-chip-inactive { background: #f1f5f9; color: #94a3b8; }
        .le-chip-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        /* Actions */
        .le-actions {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          opacity: 0;
          transition: opacity 0.15s;
          flex-shrink: 0;
        }
        .le-row:hover .le-actions { opacity: 1; }

        .le-action-btn {
          width: 30px; height: 30px;
          border-radius: 8px;
          border: 1px solid transparent;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          background: transparent;
          transition: all 0.15s;
        }
        .le-edit-btn { color: #2563eb; }
        .le-edit-btn:hover { background: #eff6ff; border-color: #dbeafe; }
        .le-del-btn  { color: #dc2626; }
        .le-del-btn:hover  { background: #fef2f2; border-color: #fee2e2; }

        /* Empty */
        .le-empty {
          text-align: center;
          padding: 2.5rem 1rem;
          color: #94a3b8;
          font-size: 0.85rem;
        }
        .le-empty-icon { font-size: 2rem; margin-bottom: 0.4rem; }

        /* Divider */
        .le-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 0.75rem 0 0;
        }
      `}</style>

            <div className="le-card">
                <div className="le-header">
                    <div className="le-title-group">
                        <div className="le-title-icon"><Rocket size={17} /></div>
                        <span className="le-title">Encuestas Creadas</span>
                    </div>
                    <span className="le-count">{encuestas.length} total</span>
                </div>

                {encuestas.length === 0 ? (
                    <div className="le-empty">
                        <div className="le-empty-icon">🗳️</div>
                        <p>No hay encuestas creadas aún</p>
                    </div>
                ) : (
                    <>
                        {activas.length > 0 && (
                            <>
                                <div className="le-section-label">● Activa</div>
                                {activas.map(e => (
                                    <EncuestaRow key={e.id} e={e} onEdit={onEdit} onDelete={eliminarEncuesta} />
                                ))}
                            </>
                        )}

                        {cerradas.length > 0 && (
                            <>
                                {activas.length > 0 && <div className="le-divider" />}
                                <div className="le-section-label">Cerradas</div>
                                {cerradas.map(e => (
                                    <EncuestaRow key={e.id} e={e} onEdit={onEdit} onDelete={eliminarEncuesta} />
                                ))}
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    )
}

function EncuestaRow({ e, onEdit, onDelete }: { e: any; onEdit: (e: any) => void; onDelete: (id: string) => void }) {
    const isActive = e.estado === 'activa'
    return (
        <div className="le-row">
            <div className="le-row-left">
                <div className={`le-status-icon ${isActive ? 'le-status-active' : 'le-status-inactive'}`}>
                    {isActive ? <Rocket size={16} /> : <Clock size={16} />}
                </div>
                <div style={{ minWidth: 0 }}>
                    <div className="le-row-title">{e.titulo}</div>
                    <div className={`le-status-chip ${isActive ? 'le-chip-active' : 'le-chip-inactive'}`}>
                        <span className="le-chip-dot" />
                        {e.estado}
                    </div>
                </div>
            </div>
            <div className="le-actions">
                <button className="le-action-btn le-edit-btn" onClick={() => onEdit(e)} title="Editar">
                    <Edit2 size={13} />
                </button>
                <button className="le-action-btn le-del-btn" onClick={() => onDelete(e.id)} title="Eliminar">
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    )
}