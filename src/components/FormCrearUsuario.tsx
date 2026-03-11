'use client'

import { useState } from 'react'
import { crearPropietario } from '@/app/dashboard/admin/accionesAdmin'
import { UserPlus, CheckCircle2, AlertCircle, ChevronRight, Loader2 } from 'lucide-react'

export default function FormCrearUsuario() {
    const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'error' | 'exito' } | null>(null)
    const [cargando, setCargando] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setCargando(true)
        setMensaje(null)
        const formData = new FormData(e.currentTarget)
        const respuesta = await crearPropietario(formData)
        if (respuesta.error) {
            setMensaje({ texto: respuesta.error, tipo: 'error' })
        } else if (respuesta.success) {
            setMensaje({ texto: respuesta.mensaje!, tipo: 'exito' })
                ; (e.target as HTMLFormElement).reset()
        }
        setCargando(false)
    }

    return (
        <>
            <style>{`
        .fcu-card {
          background: white;
          border: 1px solid #e8ecf2;
          border-radius: 1.5rem;
          padding: 1.75rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .fcu-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .fcu-icon-wrap {
          width: 42px; height: 42px;
          border-radius: 12px;
          background: #f5f3ff;
          color: #7c3aed;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .fcu-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.2px;
        }

        .fcu-subtitle {
          font-size: 0.68rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 1px;
        }

        .fcu-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }
        @media (max-width: 560px) {
          .fcu-grid { grid-template-columns: 1fr; }
        }

        .fcu-field { display: flex; flex-direction: column; gap: 0.3rem; }

        .fcu-label {
          font-size: 0.67rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.09em;
        }

        .fcu-input {
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
          -webkit-appearance: none;
        }
        .fcu-input:focus {
          border-color: #7c3aed;
          background: white;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
        }
        .fcu-input::placeholder { color: #b0b8c8; }

        .fcu-span2 { grid-column: span 2; }
        @media (max-width: 560px) { .fcu-span2 { grid-column: span 1; } }

        .fcu-feedback {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.84rem;
          font-weight: 600;
          animation: feedbackIn 0.25s ease both;
        }
        @keyframes feedbackIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fcu-feedback-exito { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
        .fcu-feedback-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }

        .fcu-submit {
          width: 100%;
          padding: 0.9rem 1rem;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #6d28d9, #7c3aed);
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          transition: all 0.18s;
          box-shadow: 0 3px 14px rgba(124,58,237,0.3);
          letter-spacing: 0.01em;
        }
        .fcu-submit:hover { filter: brightness(1.08); transform: translateY(-1px); box-shadow: 0 5px 18px rgba(124,58,237,0.4); }
        .fcu-submit:active { transform: scale(0.985); filter: brightness(0.97); }
        .fcu-submit:disabled { opacity: 0.6; pointer-events: none; }
      `}</style>

            <div className="fcu-card">
                <div className="fcu-header">
                    <div className="fcu-icon-wrap"><UserPlus size={20} /></div>
                    <div>
                        <div className="fcu-title">Agregar Propietario</div>
                        <div className="fcu-subtitle">Crear acceso al sistema</div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="fcu-grid">
                        <div className="fcu-field">
                            <label className="fcu-label">Usuario / Unidad</label>
                            <input name="usuario" type="text" required placeholder="Ej: apto101" className="fcu-input" />
                        </div>
                        <div className="fcu-field">
                            <label className="fcu-label">Nombre Completo</label>
                            <input name="nombre" type="text" required placeholder="Ej: Juan Pérez" className="fcu-input" />
                        </div>
                        <div className="fcu-field">
                            <label className="fcu-label">Coeficiente (%)</label>
                            <input name="coeficiente" type="number" step="0.0001" required placeholder="Ej: 1.2345" className="fcu-input" />
                        </div>
                        <div className="fcu-field">
                            <label className="fcu-label">Contraseña</label>
                            <input name="password" type="password" required placeholder="••••••••" className="fcu-input" />
                        </div>

                        {mensaje && (
                            <div className={`fcu-span2 fcu-feedback ${mensaje.tipo === 'exito' ? 'fcu-feedback-exito' : 'fcu-feedback-error'}`}>
                                {mensaje.tipo === 'exito' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                {mensaje.texto}
                            </div>
                        )}

                        <div className="fcu-span2">
                            <button type="submit" disabled={cargando} className="fcu-submit">
                                {cargando
                                    ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Procesando…</>
                                    : <><UserPlus size={16} /> Guardar Propietario <ChevronRight size={15} /></>
                                }
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </>
    )
}