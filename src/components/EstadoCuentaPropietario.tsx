'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { FileText, Download, Loader2, Clock } from 'lucide-react'

interface EstadoCuenta {
    id: string
    archivo_url: string
    archivo_nombre: string
    periodo: string
    created_at: string
}

export default function EstadoCuentaPropietario() {
    const [estados, setEstados] = useState<EstadoCuenta[]>([])
    const [cargando, setCargando] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)
    const supabase = createClient()

    const cargarEstados = async (uid: string) => {
        const { data } = await supabase
            .from('estados_cuenta')
            .select('id, archivo_url, archivo_nombre, periodo, created_at')
            .eq('propietario_id', uid)
            .order('created_at', { ascending: false })
        if (data) setEstados(data)
        setCargando(false)
    }

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setCargando(false); return }
            setUserId(user.id)
            await cargarEstados(user.id)

            // Realtime: escucha inserts/deletes en estados_cuenta para este propietario
            const canal = supabase
                .channel(`estados-cuenta-${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'estados_cuenta',
                        filter: `propietario_id=eq.${user.id}`
                    },
                    () => cargarEstados(user.id)
                )
                .subscribe()

            return () => { supabase.removeChannel(canal) }
        }
        init()
    }, [])

    return (
        <>
            <style>{`
        .ec-prop-card {
          background: white;
          border: 1px solid #e8ecf2;
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(0,0,0,0.05);
          animation: pevIn 0.35s 0.15s cubic-bezier(0.22,1,0.36,1) both;
        }

        .ec-prop-header {
          padding: 1.1rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .ec-prop-header-icon {
          width: 34px; height: 34px;
          border-radius: 9px;
          background: #eff6ff;
          color: #2563eb;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .ec-prop-header-title {
          font-family: 'Syne', sans-serif;
          font-size: 0.92rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.1px;
        }

        .ec-prop-header-sub {
          font-size: 0.65rem;
          color: #94a3b8;
          font-weight: 500;
          margin-top: 1px;
        }

        /* Loading */
        .ec-prop-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 2rem;
          color: #94a3b8;
          font-size: 0.82rem;
        }

        /* Empty */
        .ec-prop-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          text-align: center;
          gap: 0.5rem;
          color: #94a3b8;
        }

        .ec-prop-empty-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: #f8fafc;
          color: #cbd5e1;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 0.25rem;
        }

        .ec-prop-empty-title {
          font-size: 0.84rem;
          font-weight: 600;
          color: #64748b;
        }

        .ec-prop-empty-sub {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        /* List */
        .ec-prop-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .ec-prop-item {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f8fafc;
          transition: background 0.12s;
        }
        .ec-prop-item:last-child { border-bottom: none; }
        .ec-prop-item:hover { background: #fafbfd; }

        .ec-prop-item-icon {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: #eff6ff;
          color: #2563eb;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .ec-prop-item-info { flex: 1; min-width: 0; }

        .ec-prop-item-periodo {
          font-size: 0.88rem;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ec-prop-item-meta {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.7rem;
          color: #94a3b8;
          margin-top: 2px;
        }

        .ec-prop-item-filename {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 160px;
        }

        .ec-prop-download {
          width: 36px; height: 36px;
          border-radius: 9px;
          border: 1.5px solid #dbeafe;
          background: #eff6ff;
          color: #2563eb;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          cursor: pointer;
          transition: all 0.15s;
          text-decoration: none;
        }
        .ec-prop-download:hover {
          background: #2563eb;
          border-color: #2563eb;
          color: white;
          transform: scale(1.05);
        }

        /* New badge animation */
        .ec-prop-new-badge {
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          background: #dcfce7;
          color: #15803d;
          border: 1px solid #bbf7d0;
          border-radius: 99px;
          padding: 1px 7px;
          animation: newBadgeIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes newBadgeIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }

        @keyframes pevIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

            <div className="ec-prop-card">
                {/* Header */}
                <div className="ec-prop-header">
                    <div className="ec-prop-header-icon">
                        <FileText size={17} />
                    </div>
                    <div>
                        <div className="ec-prop-header-title">Documentos</div>
                        <div className="ec-prop-header-sub">Documentos enviados por administración</div>
                    </div>
                </div>

                {/* Content */}
                {cargando ? (
                    <div className="ec-prop-loading">
                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        Cargando documentos…
                    </div>
                ) : estados.length === 0 ? (
                    <div className="ec-prop-empty">
                        <div className="ec-prop-empty-icon"><Clock size={20} /></div>
                        <div className="ec-prop-empty-title">Sin documentos aún</div>
                        <p className="ec-prop-empty-sub">Aquí aparecerán tus documentos cuando la administración los suba.</p>
                    </div>
                ) : (
                    <div className="ec-prop-list">
                        {estados.map((e, i) => {
                            const esReciente = (Date.now() - new Date(e.created_at).getTime()) < 1000 * 60 * 5 // menos de 5 min
                            return (
                                <div key={e.id} className="ec-prop-item">
                                    <div className="ec-prop-item-icon">
                                        <FileText size={17} />
                                    </div>
                                    <div className="ec-prop-item-info">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <span className="ec-prop-item-periodo">{e.periodo}</span>
                                            {esReciente && <span className="ec-prop-new-badge">Nuevo</span>}
                                        </div>
                                        <div className="ec-prop-item-meta">
                                            <span className="ec-prop-item-filename">{e.archivo_nombre}</span>
                                            <span>·</span>
                                            <span style={{ whiteSpace: 'nowrap' }}>
                                                {new Date(e.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>
                                    </div>
                                    <a
                                        href={e.archivo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ec-prop-download"
                                        title="Descargar"
                                    >
                                        <Download size={15} />
                                    </a>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </>
    )
}