'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Rocket, Megaphone, Upload, AlertCircle, CheckCircle2, ChevronRight, X } from 'lucide-react'

export default function ControlProgramador({ encuestaAEditar, limpiarEdicion }: any) {
    const [titulo, setTitulo] = useState('')
    const [desc, setDesc] = useState('')
    const [opciones, setOpciones] = useState('')
    const [archivo, setArchivo] = useState<File | null>(null)
    const [textoMensaje, setTextoMensaje] = useState('')
    const [cargando, setCargando] = useState(false)
    const [notificacion, setNotificacion] = useState<{ tipo: 'success' | 'error', msg: string } | null>(null)

    const supabase = createClient()

    const mostrarNotificacion = (tipo: 'success' | 'error', msg: string) => {
        setNotificacion({ tipo, msg })
        setTimeout(() => setNotificacion(null), 3500)
    }

    useEffect(() => {
        if (encuestaAEditar) {
            setTitulo(encuestaAEditar.titulo)
            setDesc(encuestaAEditar.descripcion)
            setOpciones(encuestaAEditar.opciones.join(', '))
        } else {
            setTitulo(''); setDesc(''); setOpciones('')
        }
    }, [encuestaAEditar])

    const lanzarVotacion = async () => {
        const opcionesArray = opciones.split(',').map(o => o.trim()).filter(o => o !== '')
        if (!titulo.trim() || opcionesArray.length === 0)
            return mostrarNotificacion('error', 'Título y opciones son obligatorios')

        setCargando(true)
        try {
            let imagen_url = encuestaAEditar?.imagen_url || null
            if (archivo) {
                const fileName = `${Date.now()}-${archivo.name}`
                const { data: uploadData } = await supabase.storage.from('encuestas').upload(fileName, archivo)
                if (uploadData) {
                    const { data } = supabase.storage.from('encuestas').getPublicUrl(fileName)
                    imagen_url = data.publicUrl
                }
            }
            if (encuestaAEditar) {
                await supabase.from('preguntas').update({ titulo, descripcion: desc, opciones: opcionesArray, imagen_url }).eq('id', encuestaAEditar.id)
                mostrarNotificacion('success', 'Encuesta actualizada')
                limpiarEdicion()
            } else {
                await supabase.from('preguntas').update({ estado: 'cerrada' }).eq('estado', 'activa')
                await supabase.from('preguntas').insert({ titulo, descripcion: desc, opciones: opcionesArray, imagen_url, estado: 'activa' })
                mostrarNotificacion('success', 'Encuesta lanzada exitosamente')
            }
            setTitulo(''); setDesc(''); setOpciones(''); setArchivo(null)
        } catch {
            mostrarNotificacion('error', 'Error al procesar')
        } finally {
            setCargando(false)
        }
    }

    const publicarMensaje = async () => {
        if (!textoMensaje.trim()) return mostrarNotificacion('error', 'Escribe un mensaje')
        setCargando(true)
        await supabase.from('mensajes').update({ estado: 'inactivo' }).eq('estado', 'activo')
        await supabase.from('mensajes').insert({ texto: textoMensaje, estado: 'activo' })
        setTextoMensaje('')
        mostrarNotificacion('success', 'Mensaje publicado')
        setCargando(false)
    }

    return (
        <>
            <style>{`
        .cp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        @media (max-width: 860px) {
          .cp-grid { grid-template-columns: 1fr; }
        }

        .cp-card {
          background: white;
          border-radius: 1.5rem;
          border: 1px solid #e8ecf2;
          padding: 1.75rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .cp-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .cp-card-title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .cp-icon-wrap {
          width: 42px; height: 42px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .cp-icon-blue  { background: #eff6ff; color: #2563eb; }
        .cp-icon-amber { background: #fffbeb; color: #d97706; }

        .cp-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.2px;
        }

        .cp-card-sub {
          font-size: 0.68rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 1px;
        }

        .cp-close-btn {
          width: 32px; height: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #64748b;
          transition: background 0.15s, color 0.15s;
        }
        .cp-close-btn:hover { background: #fee2e2; color: #dc2626; border-color: #fecaca; }

        .cp-fields { display: flex; flex-direction: column; gap: 0.75rem; }

        .cp-input, .cp-textarea {
          width: 100%;
          padding: 0.8rem 1rem;
          border-radius: 10px;
          border: 1.5px solid #e8ecf2;
          background: #f8fafc;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
          resize: none;
          -webkit-appearance: none;
        }
        .cp-input:focus, .cp-textarea:focus {
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .cp-input::placeholder, .cp-textarea::placeholder { color: #b0b8c8; }

        .cp-input-mono {
          font-family: 'Courier New', monospace;
          font-size: 0.82rem;
          color: #2563eb;
          letter-spacing: 0.02em;
        }

        .cp-upload {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1rem;
          border: 1.5px dashed #cbd5e1;
          border-radius: 10px;
          cursor: pointer;
          transition: border-color 0.18s, background 0.18s;
          background: #f8fafc;
        }
        .cp-upload:hover { border-color: #93c5fd; background: #eff6ff; }

        .cp-upload-text { font-size: 0.82rem; color: #64748b; }
        .cp-upload-icon { color: #94a3b8; flex-shrink: 0; }

        .cp-btn-primary {
          width: 100%;
          padding: 0.9rem 1rem;
          border-radius: 10px;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          transition: all 0.18s;
          margin-top: 0.25rem;
          letter-spacing: 0.01em;
        }

        .cp-btn-blue {
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          color: white;
          box-shadow: 0 3px 14px rgba(59,130,246,0.3);
        }
        .cp-btn-blue:hover { filter: brightness(1.07); box-shadow: 0 5px 18px rgba(59,130,246,0.4); transform: translateY(-1px); }
        .cp-btn-blue:active { transform: scale(0.985); filter: brightness(0.97); }

        .cp-btn-amber {
          background: linear-gradient(135deg, #b45309, #f59e0b);
          color: white;
          box-shadow: 0 3px 14px rgba(245,158,11,0.3);
        }
        .cp-btn-amber:hover { filter: brightness(1.07); transform: translateY(-1px); }
        .cp-btn-amber:active { transform: scale(0.985); }

        .cp-btn-disabled { opacity: 0.65; pointer-events: none; }

        /* Notification */
        .cp-notif {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          z-index: 200;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.85rem 1.25rem;
          border-radius: 12px;
          font-size: 0.88rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 8px 30px rgba(0,0,0,0.1);
          animation: notifIn 0.25s cubic-bezier(0.22,1,0.36,1) both;
          max-width: calc(100vw - 3rem);
        }
        .cp-notif-success { background: white; border: 1px solid #bbf7d0; color: #15803d; }
        .cp-notif-error   { background: white; border: 1px solid #fecaca; color: #dc2626; }
        @keyframes notifIn {
          from { opacity: 0; transform: translateX(20px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>

            {notificacion && (
                <div className={`cp-notif ${notificacion.tipo === 'success' ? 'cp-notif-success' : 'cp-notif-error'}`}>
                    {notificacion.tipo === 'success' ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
                    {notificacion.msg}
                </div>
            )}

            <div className="cp-grid">
                {/* ENCUESTA */}
                <div className="cp-card">
                    <div className="cp-card-header">
                        <div className="cp-card-title-group">
                            <div className="cp-icon-wrap cp-icon-blue"><Rocket size={20} /></div>
                            <div>
                                <div className="cp-card-title">{encuestaAEditar ? 'Editar Encuesta' : 'Nueva Encuesta'}</div>
                                <div className="cp-card-sub">Panel de votaciones</div>
                            </div>
                        </div>
                        {encuestaAEditar && (
                            <button className="cp-close-btn" onClick={limpiarEdicion}><X size={15} /></button>
                        )}
                    </div>

                    <div className="cp-fields">
                        <input
                            className="cp-input"
                            type="text"
                            value={titulo}
                            onChange={e => setTitulo(e.target.value)}
                            placeholder="Título de la pregunta"
                        />
                        <textarea
                            className="cp-textarea"
                            style={{ height: '80px' }}
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            placeholder="Descripción breve (opcional)"
                        />
                        <input
                            className={`cp-input cp-input-mono`}
                            type="text"
                            value={opciones}
                            onChange={e => setOpciones(e.target.value)}
                            placeholder="Ej: Apruebo, No Apruebo, Abstención"
                        />
                        <label className="cp-upload">
                            <Upload size={16} className="cp-upload-icon" />
                            <span className="cp-upload-text">{archivo ? archivo.name : 'Adjuntar imagen (opcional)'}</span>
                            <input type="file" className="hidden" onChange={e => setArchivo(e.target.files?.[0] || null)} />
                        </label>
                        <button
                            className={`cp-btn-primary cp-btn-blue ${cargando ? 'cp-btn-disabled' : ''}`}
                            onClick={lanzarVotacion}
                        >
                            {cargando ? 'Procesando...' : (encuestaAEditar ? 'Actualizar Encuesta' : 'Lanzar Encuesta')}
                            {!cargando && <ChevronRight size={17} />}
                        </button>
                    </div>
                </div>

                {/* ANUNCIO */}
                <div className="cp-card">
                    <div className="cp-card-header">
                        <div className="cp-card-title-group">
                            <div className="cp-icon-wrap cp-icon-amber"><Megaphone size={20} /></div>
                            <div>
                                <div className="cp-card-title">Anuncio Global</div>
                                <div className="cp-card-sub">Mensaje en tiempo real</div>
                            </div>
                        </div>
                    </div>
                    <div className="cp-fields">
                        <textarea
                            className="cp-textarea"
                            style={{ height: '148px' }}
                            value={textoMensaje}
                            onChange={e => setTextoMensaje(e.target.value)}
                            placeholder="Escribe el anuncio que verán todos los propietarios…"
                        />
                        <button
                            className={`cp-btn-primary cp-btn-amber ${cargando ? 'cp-btn-disabled' : ''}`}
                            onClick={publicarMensaje}
                        >
                            {cargando ? 'Publicando...' : 'Publicar Anuncio'}
                            {!cargando && <ChevronRight size={17} />}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}