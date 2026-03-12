'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User, Loader2, Hash } from 'lucide-react'

interface Propietario {
    id: string
    nombre: string
    usuario: string
    coeficiente: number
}

export default function ListaPropietarios() {
    const [propietarios, setPropietarios] = useState<Propietario[]>([])
    const [cargando, setCargando] = useState(true)
    const supabase = createClient()

    const cargar = async () => {
        const { data } = await supabase
            .from('perfiles')
            .select('id, nombre, usuario, coeficiente')
            .eq('rol', 'propietario')
            .order('nombre', { ascending: true })
        if (data) setPropietarios(data)
        setCargando(false)
    }

    useEffect(() => {
        cargar()
        const canal = supabase.channel('lista-propietarios-realtime')
            .on('postgres_changes', {
                event: '*', schema: 'public', table: 'perfiles'
            }, cargar)
            .subscribe()
        return () => { supabase.removeChannel(canal) }
    }, [])

    return (
        <>
            <style>{`
        .lp-card {
          background: white;
          border: 1px solid #e8ecf2;
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .lp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.1rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .lp-header-left {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .lp-header-icon {
          width: 34px; height: 34px;
          border-radius: 9px;
          background: #f5f3ff;
          color: #7c3aed;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .lp-header-title {
          font-family: 'Syne', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.1px;
        }

        .lp-count {
          font-size: 0.7rem;
          font-weight: 700;
          background: #f1f5f9;
          color: #64748b;
          padding: 3px 10px;
          border-radius: 99px;
          letter-spacing: 0.04em;
        }

        /* Loading */
        .lp-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 2.5rem;
          color: #94a3b8;
          font-size: 0.85rem;
        }

        /* Empty */
        .lp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2.5rem 1rem;
          gap: 0.5rem;
          text-align: center;
          color: #94a3b8;
          font-size: 0.85rem;
        }
        .lp-empty-icon { font-size: 2rem; margin-bottom: 0.25rem; }

        /* Table */
        .lp-table-wrap { overflow-x: auto; }

        .lp-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.84rem;
          font-family: 'DM Sans', sans-serif;
        }

        .lp-table th {
          text-align: left;
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
          padding: 0.65rem 1.25rem;
          background: #f8fafc;
          border-bottom: 1px solid #f1f5f9;
          white-space: nowrap;
        }

        .lp-table th:last-child { text-align: right; }

        .lp-table td {
          padding: 0.85rem 1.25rem;
          border-bottom: 1px solid #f8fafc;
          vertical-align: middle;
        }

        .lp-table tr:last-child td { border-bottom: none; }
        .lp-table tr:hover td { background: #fafbfd; }

        /* Number column */
        .lp-num {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: #f1f5f9;
          color: #64748b;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.72rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        /* Name cell */
        .lp-name-cell {
          display: flex;
          align-items: center;
          gap: 0.7rem;
        }

        .lp-avatar {
          width: 34px; height: 34px;
          border-radius: 10px;
          background: #f5f3ff;
          color: #7c3aed;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .lp-name {
          font-weight: 600;
          color: #0f172a;
          font-size: 0.86rem;
        }

        .lp-usuario {
          font-size: 0.7rem;
          color: #94a3b8;
          margin-top: 1px;
        }

        /* Coef */
        .lp-coef {
          font-family: 'Courier New', monospace;
          font-weight: 700;
          font-size: 0.82rem;
          color: #334155;
        }

        /* Date */
        .lp-date {
          font-size: 0.76rem;
          color: #94a3b8;
          white-space: nowrap;
        }

        /* Rol chip */
        .lp-rol-chip {
          display: inline-flex;
          padding: 2px 9px;
          border-radius: 99px;
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          background: #f0fdf4;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }

        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

            <div className="lp-card">
                <div className="lp-header">
                    <div className="lp-header-left">
                        <div className="lp-header-icon"><User size={17} /></div>
                        <span className="lp-header-title">Propietarios Registrados</span>
                    </div>
                    <span className="lp-count">{propietarios.length} registrados</span>
                </div>

                {cargando ? (
                    <div className="lp-loading">
                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        Cargando propietarios…
                    </div>
                ) : propietarios.length === 0 ? (
                    <div className="lp-empty">
                        <div className="lp-empty-icon">👤</div>
                        <p>Aún no hay propietarios registrados.<br />Usa el formulario de arriba para agregar el primero.</p>
                    </div>
                ) : (
                    <div className="lp-table-wrap">
                        <table className="lp-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Propietario</th>
                                    <th>Coef.</th>
                                    <th>Rol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {propietarios.map((p, i) => (
                                    <tr key={p.id}>
                                        <td>
                                            <div className="lp-num">{i + 1}</div>
                                        </td>
                                        <td>
                                            <div className="lp-name-cell">
                                                <div className="lp-avatar"><User size={15} /></div>
                                                <div>
                                                    <div className="lp-name">{p.nombre}</div>
                                                    <div className="lp-usuario">{p.usuario}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="lp-coef">{Number(p.coeficiente).toFixed(4)}%</span>
                                        </td>
                                        <td>
                                            <span className="lp-rol-chip">propietario</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </>
    )
}