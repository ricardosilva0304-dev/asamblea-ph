'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { CheckCircle2, Clock, Loader2 } from 'lucide-react'

type Pregunta = { id: string; titulo: string; descripcion?: string; estado: string; opciones: string[] }
type Perfil = { id: string; coeficiente: number }

export default function PreguntaEnVivo() {
    const [preguntaActiva, setPreguntaActiva] = useState<Pregunta | null>(null)
    const [perfil, setPerfil] = useState<Perfil | null>(null)
    const [yaVote, setYaVote] = useState(false)
    const [opcionVotada, setOpcionVotada] = useState<string | null>(null)
    const [votando, setVotando] = useState<string | null>(null) // opción en proceso
    const [cargando, setCargando] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const cargarDatos = async () => {
            setCargando(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setCargando(false); return }

            const { data: perfilData } = await supabase
                .from('perfiles').select('id, coeficiente').eq('id', user.id).single()
            if (perfilData) setPerfil(perfilData)

            const { data: pregunta } = await supabase
                .from('preguntas').select('*').eq('estado', 'activa').single()

            if (pregunta) {
                setPreguntaActiva(pregunta)
                const { data: votoExistente } = await supabase
                    .from('votos').select('opcion').eq('pregunta_id', pregunta.id).eq('usuario_id', user.id).maybeSingle()
                if (votoExistente) {
                    setYaVote(true)
                    setOpcionVotada(votoExistente.opcion)
                } else {
                    setYaVote(false)
                    setOpcionVotada(null)
                }
            } else {
                setPreguntaActiva(null)
                setYaVote(false)
                setOpcionVotada(null)
            }
            setCargando(false)
        }

        cargarDatos()

        const canal = supabase.channel('preguntas-propietario')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'preguntas' }, cargarDatos)
            .subscribe()

        return () => { supabase.removeChannel(canal) }
    }, [supabase])

    const emitirVoto = async (opcion: string) => {
        if (!preguntaActiva || !perfil || yaVote || votando) return
        setVotando(opcion)

        const { error } = await supabase.from('votos').insert({
            pregunta_id: preguntaActiva.id,
            usuario_id: perfil.id,
            opcion,
            coeficiente: perfil.coeficiente
        })

        if (!error) {
            setYaVote(true)
            setOpcionVotada(opcion)
        }
        setVotando(null)
    }

    return (
        <>
            <style>{`
        /* ── Card ── */
        .pev-card {
          background: white;
          border: 1px solid #e8ecf2;
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(0,0,0,0.05);
          animation: pevIn 0.35s 0.1s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes pevIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Loading state */
        .pev-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          gap: 0.75rem;
          color: #94a3b8;
          font-size: 0.85rem;
        }

        /* Waiting state */
        .pev-waiting {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          text-align: center;
          gap: 0.75rem;
        }

        .pev-waiting-icon {
          width: 56px; height: 56px;
          border-radius: 16px;
          background: #f1f5f9;
          color: #94a3b8;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 0.25rem;
        }

        .pev-waiting-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: #64748b;
        }

        .pev-waiting-sub {
          font-size: 0.8rem;
          color: #94a3b8;
          line-height: 1.5;
        }

        .pev-waiting-pulse {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: #94a3b8;
          background: #f8fafc;
          border: 1px solid #e8ecf2;
          border-radius: 99px;
          padding: 5px 12px;
          margin-top: 0.25rem;
        }
        .pev-waiting-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #94a3b8;
          animation: waitPulse 2s ease-in-out infinite;
        }
        @keyframes waitPulse {
          0%,100% { opacity: 1; }
          50%     { opacity: 0.3; }
        }

        /* Question header */
        .pev-q-header {
          padding: 1.5rem 1.5rem 1.25rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .pev-q-label {
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #2563eb;
          margin-bottom: 0.5rem;
        }

        .pev-q-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.3;
          letter-spacing: -0.2px;
        }

        .pev-q-desc {
          font-size: 0.82rem;
          color: #64748b;
          margin-top: 0.4rem;
          line-height: 1.5;
        }

        /* Options */
        .pev-options {
          padding: 1.25rem 1.5rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .pev-opt-btn {
          width: 100%;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          border: 2px solid #e8ecf2;
          background: #f8fafc;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          transition: all 0.18s;
          text-align: left;
          -webkit-appearance: none;
          touch-action: manipulation;
        }

        .pev-opt-btn:hover:not(:disabled) {
          border-color: #93c5fd;
          background: #eff6ff;
          color: #1d4ed8;
          transform: translateX(3px);
          box-shadow: 0 2px 10px rgba(59,130,246,0.12);
        }

        .pev-opt-btn:active:not(:disabled) {
          transform: scale(0.98) translateX(0);
        }

        .pev-opt-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .pev-opt-btn.loading {
          border-color: #93c5fd;
          background: #eff6ff;
          color: #2563eb;
        }

        .pev-opt-arrow {
          width: 28px; height: 28px;
          border-radius: 8px;
          background: white;
          border: 1px solid #e2e8f0;
          display: flex; align-items: center; justify-content: center;
          color: #94a3b8;
          flex-shrink: 0;
          font-size: 0.75rem;
          transition: all 0.18s;
        }
        .pev-opt-btn:hover:not(:disabled) .pev-opt-arrow {
          background: #2563eb;
          border-color: #2563eb;
          color: white;
        }

        /* Success state */
        .pev-success {
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.75rem;
        }

        .pev-success-icon {
          width: 64px; height: 64px;
          border-radius: 20px;
          background: #f0fdf4;
          color: #16a34a;
          display: flex; align-items: center; justify-content: center;
          animation: successPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes successPop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }

        .pev-success-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #15803d;
        }

        .pev-success-sub {
          font-size: 0.82rem;
          color: #64748b;
        }

        .pev-success-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 6px 16px;
          border-radius: 99px;
          background: #dcfce7;
          border: 1px solid #bbf7d0;
          font-size: 0.8rem;
          font-weight: 700;
          color: #15803d;
          margin-top: 0.25rem;
        }

        /* Divider in waiting */
        .pev-hr { height:1px; background:#f1f5f9; margin: 0; }
      `}</style>

            <div className="pev-card">
                {cargando ? (
                    <div className="pev-loading">
                        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#94a3b8' }} />
                        <span>Cargando votación…</span>
                    </div>
                ) : !preguntaActiva ? (
                    <div className="pev-waiting">
                        <div className="pev-waiting-icon"><Clock size={26} /></div>
                        <div className="pev-waiting-title">Sin votación activa</div>
                        <p className="pev-waiting-sub">El administrador aún no ha iniciado<br />ninguna votación.</p>
                        <div className="pev-waiting-pulse">
                            <div className="pev-waiting-dot" />
                            Esperando en tiempo real…
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header de pregunta */}
                        <div className="pev-q-header">
                            <div className="pev-q-label">Pregunta activa</div>
                            <div className="pev-q-title">{preguntaActiva.titulo}</div>
                            {preguntaActiva.descripcion && (
                                <p className="pev-q-desc">{preguntaActiva.descripcion}</p>
                            )}
                        </div>

                        {yaVote ? (
                            <div className="pev-success">
                                <div className="pev-success-icon">
                                    <CheckCircle2 size={32} />
                                </div>
                                <div className="pev-success-title">¡Voto registrado!</div>
                                <p className="pev-success-sub">Tu participación ha sido confirmada.</p>
                                {opcionVotada && (
                                    <div className="pev-success-chip">
                                        ✓ Votaste por: {opcionVotada}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="pev-options">
                                {preguntaActiva.opciones.map((opcion) => {
                                    const isLoading = votando === opcion
                                    return (
                                        <button
                                            key={opcion}
                                            className={`pev-opt-btn ${isLoading ? 'loading' : ''}`}
                                            onClick={() => emitirVoto(opcion)}
                                            disabled={!!votando}
                                        >
                                            <span>{opcion}</span>
                                            <span className="pev-opt-arrow">
                                                {isLoading
                                                    ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                                    : '→'
                                                }
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </>
    )
}