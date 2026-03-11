'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    FileText, Upload, Trash2, CheckCircle2, AlertCircle,
    Search, User, ChevronDown, ExternalLink, Loader2
} from 'lucide-react'

interface Propietario {
    id: string
    nombre: string
    apartamento: string
    email?: string
}

interface EstadoCuenta {
    id: string
    propietario_id: string
    archivo_url: string
    archivo_nombre: string
    periodo: string
    created_at: string
}

export default function EstadosCuenta() {
    const supabase = createClient()

    const [propietarios, setPropietarios] = useState<Propietario[]>([])
    const [estados, setEstados] = useState<EstadoCuenta[]>([])
    const [busqueda, setBusqueda] = useState('')
    const [propietarioSel, setPropietarioSel] = useState<Propietario | null>(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [archivo, setArchivo] = useState<File | null>(null)
    const [periodo, setPeriodo] = useState('')
    const [cargando, setCargando] = useState(false)
    const [cargandoLista, setCargandoLista] = useState(true)
    const [notif, setNotif] = useState<{ tipo: 'success' | 'error'; msg: string } | null>(null)

    const mostrarNotif = (tipo: 'success' | 'error', msg: string) => {
        setNotif({ tipo, msg })
        setTimeout(() => setNotif(null), 3500)
    }

    useEffect(() => {
        cargarPropietarios()
        cargarEstados()
    }, [])

    const cargarPropietarios = async () => {
        const { data } = await supabase
            .from('perfiles')
            .select('id, nombre, usuario')
            .eq('rol', 'propietario')
            .order('nombre')
        if (data) setPropietarios(data.map(p => ({
            id: p.id,
            nombre: p.nombre,
            apartamento: p.usuario,
            email: undefined
        })))
    }

    const cargarEstados = async () => {
        setCargandoLista(true)
        const { data } = await supabase
            .from('estados_cuenta')
            .select('*')
            .order('created_at', { ascending: false })
        if (data) setEstados(data)
        setCargandoLista(false)
    }

    const subir = async () => {
        if (!propietarioSel) return mostrarNotif('error', 'Selecciona un propietario')
        if (!archivo) return mostrarNotif('error', 'Selecciona un archivo PDF')
        if (!periodo.trim()) return mostrarNotif('error', 'Indica el período (Ej: Enero 2026)')

        setCargando(true)
        try {
            const fileName = `${propietarioSel.id}/${Date.now()}-${archivo.name}`
            const { data: upload, error: uploadError } = await supabase.storage
                .from('estados-cuenta')
                .upload(fileName, archivo)

            if (uploadError) throw uploadError

            const { data: urlData } = supabase.storage.from('estados-cuenta').getPublicUrl(fileName)

            await supabase.from('estados_cuenta').insert({
                propietario_id: propietarioSel.id,
                archivo_url: urlData.publicUrl,
                archivo_nombre: archivo.name,
                periodo: periodo.trim(),
            })

            mostrarNotif('success', `Estado de cuenta subido para ${propietarioSel.nombre}`)
            setArchivo(null)
            setPeriodo('')
            setPropietarioSel(null)
            cargarEstados()
        } catch {
            mostrarNotif('error', 'Error al subir el archivo')
        } finally {
            setCargando(false)
        }
    }

    const eliminar = async (id: string, url: string) => {
        if (!confirm('¿Eliminar este estado de cuenta?')) return
        const path = url.split('/estados-cuenta/')[1]
        if (path) await supabase.storage.from('estados-cuenta').remove([path])
        await supabase.from('estados_cuenta').delete().eq('id', id)
        cargarEstados()
        mostrarNotif('success', 'Archivo eliminado')
    }

    const propietariosFiltrados = propietarios.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.apartamento.toLowerCase().includes(busqueda.toLowerCase())
    )

    const getNombrePropietario = (id: string) =>
        propietarios.find(p => p.id === id)

    return (
        <>
            <style>{`
        .ec-wrap { display: flex; flex-direction: column; gap: 1.5rem; }

        /* ── Upload card ── */
        .ec-upload-card {
          background: white;
          border: 1px solid #e8ecf2;
          border-radius: 1.5rem;
          padding: 1.75rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .ec-section-title {
          font-family: 'Syne', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.1px;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .ec-section-icon {
          width: 34px; height: 34px;
          border-radius: 9px;
          background: #eff6ff;
          color: #2563eb;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .ec-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr auto;
          gap: 0.75rem;
          align-items: end;
        }
        @media (max-width: 900px) {
          .ec-form-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 560px) {
          .ec-form-grid { grid-template-columns: 1fr; }
        }

        .ec-field { display: flex; flex-direction: column; gap: 0.3rem; }

        .ec-label {
          font-size: 0.68rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.09em;
        }

        /* Dropdown */
        .ec-dropdown-wrap { position: relative; }

        .ec-dropdown-trigger {
          width: 100%;
          padding: 0.8rem 1rem;
          border-radius: 10px;
          border: 1.5px solid #e8ecf2;
          background: #f8fafc;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          color: #0f172a;
          cursor: pointer;
          display: flex; align-items: center; justify-content: space-between;
          gap: 0.5rem;
          transition: border-color 0.18s;
        }
        .ec-dropdown-trigger:hover { border-color: #93c5fd; }
        .ec-dropdown-trigger.open { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .ec-dropdown-trigger .placeholder { color: #b0b8c8; }

        .ec-dropdown-panel {
          position: absolute;
          top: calc(100% + 6px);
          left: 0; right: 0;
          background: white;
          border: 1.5px solid #e8ecf2;
          border-radius: 12px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.1);
          z-index: 50;
          overflow: hidden;
          animation: dropIn 0.15s ease both;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ec-search-wrap {
          padding: 0.6rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .ec-search {
          width: 100%;
          padding: 0.55rem 0.75rem 0.55rem 2rem;
          border-radius: 8px;
          border: 1.5px solid #e8ecf2;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          outline: none;
          background: #f8fafc;
        }
        .ec-search:focus { border-color: #3b82f6; background: white; }

        .ec-search-icon {
          position: absolute;
          left: 1.3rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .ec-dropdown-list { max-height: 200px; overflow-y: auto; }

        .ec-dropdown-item {
          padding: 0.65rem 1rem;
          cursor: pointer;
          display: flex; align-items: center; gap: 0.6rem;
          transition: background 0.12s;
          font-size: 0.88rem;
          color: #0f172a;
        }
        .ec-dropdown-item:hover { background: #f1f5f9; }
        .ec-dropdown-item.selected { background: #eff6ff; color: #1d4ed8; }

        .ec-apto-badge {
          font-size: 0.68rem;
          font-weight: 600;
          background: #f1f5f9;
          color: #64748b;
          padding: 1px 7px;
          border-radius: 99px;
          margin-left: auto;
        }
        .ec-dropdown-item.selected .ec-apto-badge { background: #dbeafe; color: #1d4ed8; }

        .ec-empty { padding: 1rem; text-align: center; color: #94a3b8; font-size: 0.82rem; }

        /* Input */
        .ec-input {
          width: 100%;
          padding: 0.8rem 1rem;
          border-radius: 10px;
          border: 1.5px solid #e8ecf2;
          background: #f8fafc;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          -webkit-appearance: none;
        }
        .ec-input:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .ec-input::placeholder { color: #b0b8c8; }

        /* File upload */
        .ec-file-label {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.8rem 1rem;
          border: 1.5px dashed #cbd5e1;
          border-radius: 10px;
          cursor: pointer;
          background: #f8fafc;
          font-size: 0.82rem;
          color: #64748b;
          transition: border-color 0.18s, background 0.18s;
        }
        .ec-file-label:hover { border-color: #93c5fd; background: #eff6ff; color: #2563eb; }
        .ec-file-label.has-file { border-color: #bbf7d0; background: #f0fdf4; color: #15803d; }

        /* Submit btn */
        .ec-submit-btn {
          padding: 0.8rem 1.5rem;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          display: flex; align-items: center; gap: 0.4rem;
          transition: all 0.18s;
          white-space: nowrap;
          box-shadow: 0 3px 12px rgba(59,130,246,0.3);
          height: fit-content;
        }
        .ec-submit-btn:hover { filter: brightness(1.07); transform: translateY(-1px); }
        .ec-submit-btn:disabled { opacity: 0.6; pointer-events: none; }

        /* ── List card ── */
        .ec-list-card {
          background: white;
          border: 1px solid #e8ecf2;
          border-radius: 1.5rem;
          padding: 1.75rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .ec-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .ec-count-badge {
          font-size: 0.72rem;
          font-weight: 700;
          background: #f1f5f9;
          color: #64748b;
          padding: 3px 10px;
          border-radius: 99px;
          letter-spacing: 0.04em;
        }

        .ec-table-wrap { overflow-x: auto; }

        .ec-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.86rem;
        }

        .ec-table th {
          text-align: left;
          font-size: 0.65rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 0 1rem 0.75rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .ec-table td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid #f8fafc;
          color: #334155;
          vertical-align: middle;
        }

        .ec-table tr:last-child td { border-bottom: none; }
        .ec-table tr:hover td { background: #fafbfd; }

        .ec-prop-cell {
          display: flex; align-items: center; gap: 0.6rem;
        }

        .ec-prop-avatar {
          width: 30px; height: 30px;
          border-radius: 8px;
          background: #eff6ff;
          color: #2563eb;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .ec-prop-name { font-weight: 600; color: #0f172a; font-size: 0.84rem; }
        .ec-prop-apto { font-size: 0.7rem; color: #94a3b8; margin-top: 1px; }

        .ec-periodo-chip {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 0.72rem;
          font-weight: 600;
          background: #f0fdf4;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }

        .ec-action-btns { display: flex; align-items: center; gap: 0.4rem; }

        .ec-open-btn, .ec-del-btn {
          width: 30px; height: 30px;
          border-radius: 8px;
          border: 1px solid transparent;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
          background: transparent;
        }
        .ec-open-btn { color: #2563eb; border-color: #dbeafe; }
        .ec-open-btn:hover { background: #eff6ff; }
        .ec-del-btn  { color: #dc2626; border-color: #fee2e2; }
        .ec-del-btn:hover  { background: #fef2f2; }

        .ec-empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #94a3b8;
          font-size: 0.88rem;
        }
        .ec-empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }

        /* Notif */
        .ec-notif {
          position: fixed;
          top: 1.5rem; right: 1.5rem;
          z-index: 200;
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.85rem 1.25rem;
          border-radius: 12px;
          font-size: 0.88rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 8px 30px rgba(0,0,0,0.1);
          animation: notifIn 0.25s cubic-bezier(0.22,1,0.36,1) both;
          max-width: calc(100vw - 3rem);
        }
        .ec-notif-success { background: white; border: 1px solid #bbf7d0; color: #15803d; }
        .ec-notif-error   { background: white; border: 1px solid #fecaca; color: #dc2626; }
        @keyframes notifIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

            {notif && (
                <div className={`ec-notif ${notif.tipo === 'success' ? 'ec-notif-success' : 'ec-notif-error'}`}>
                    {notif.tipo === 'success' ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
                    {notif.msg}
                </div>
            )}

            <div className="ec-wrap">
                {/* UPLOAD */}
                <div className="ec-upload-card">
                    <div className="ec-section-title">
                        <div className="ec-section-icon"><Upload size={17} /></div>
                        Subir Estado de Cuenta
                    </div>

                    <div className="ec-form-grid">
                        {/* Propietario dropdown */}
                        <div className="ec-field">
                            <label className="ec-label">Propietario</label>
                            <div className="ec-dropdown-wrap">
                                <button
                                    type="button"
                                    className={`ec-dropdown-trigger ${dropdownOpen ? 'open' : ''}`}
                                    onClick={() => setDropdownOpen(v => !v)}
                                >
                                    {propietarioSel ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <User size={14} style={{ color: '#2563eb' }} />
                                            {propietarioSel.nombre}
                                        </span>
                                    ) : (
                                        <span className="placeholder">Seleccionar propietario…</span>
                                    )}
                                    <ChevronDown size={15} style={{ color: '#94a3b8', flexShrink: 0, transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
                                </button>

                                {dropdownOpen && (
                                    <div className="ec-dropdown-panel">
                                        <div className="ec-search-wrap" style={{ position: 'relative' }}>
                                            <Search size={13} className="ec-search-icon" style={{ top: '50%', transform: 'translateY(-50%)', left: '1.25rem' }} />
                                            <input
                                                className="ec-search"
                                                placeholder="Buscar por nombre o apto…"
                                                value={busqueda}
                                                onChange={e => setBusqueda(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                        <div className="ec-dropdown-list">
                                            {propietariosFiltrados.length === 0 ? (
                                                <div className="ec-empty">Sin resultados</div>
                                            ) : propietariosFiltrados.map(p => (
                                                <div
                                                    key={p.id}
                                                    className={`ec-dropdown-item ${propietarioSel?.id === p.id ? 'selected' : ''}`}
                                                    onClick={() => { setPropietarioSel(p); setDropdownOpen(false); setBusqueda('') }}
                                                >
                                                    <User size={13} />
                                                    {p.nombre}
                                                    <span className="ec-apto-badge">Apto {p.apartamento}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Período */}
                        <div className="ec-field">
                            <label className="ec-label">Período</label>
                            <input
                                className="ec-input"
                                type="text"
                                placeholder="Ej: Enero 2026"
                                value={periodo}
                                onChange={e => setPeriodo(e.target.value)}
                            />
                        </div>

                        {/* Archivo */}
                        <div className="ec-field">
                            <label className="ec-label">Archivo PDF</label>
                            <label className={`ec-file-label ${archivo ? 'has-file' : ''}`}>
                                <FileText size={15} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {archivo ? archivo.name : 'Seleccionar archivo…'}
                                </span>
                                <input
                                    type="file"
                                    accept=".pdf,.xlsx,.xls"
                                    className="hidden"
                                    onChange={e => setArchivo(e.target.files?.[0] || null)}
                                />
                            </label>
                        </div>

                        {/* Botón */}
                        <div className="ec-field">
                            <label className="ec-label" style={{ visibility: 'hidden' }}>_</label>
                            <button className="ec-submit-btn" onClick={subir} disabled={cargando}>
                                {cargando ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={15} />}
                                {cargando ? 'Subiendo…' : 'Subir'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* LIST */}
                <div className="ec-list-card">
                    <div className="ec-list-header">
                        <div className="ec-section-title" style={{ marginBottom: 0 }}>
                            <div className="ec-section-icon"><FileText size={17} /></div>
                            Documentos Subidos
                        </div>
                        <span className="ec-count-badge">{estados.length} archivo{estados.length !== 1 ? 's' : ''}</span>
                    </div>

                    {cargandoLista ? (
                        <div className="ec-empty-state">
                            <Loader2 size={24} style={{ margin: '0 auto 0.5rem', animation: 'spin 1s linear infinite', color: '#94a3b8' }} />
                            <p>Cargando archivos…</p>
                        </div>
                    ) : estados.length === 0 ? (
                        <div className="ec-empty-state">
                            <div className="ec-empty-icon">📂</div>
                            <p>Aún no hay estados de cuenta subidos</p>
                        </div>
                    ) : (
                        <div className="ec-table-wrap">
                            <table className="ec-table">
                                <thead>
                                    <tr>
                                        <th>Propietario</th>
                                        <th>Período</th>
                                        <th>Archivo</th>
                                        <th>Fecha</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {estados.map(e => {
                                        const prop = getNombrePropietario(e.propietario_id)
                                        return (
                                            <tr key={e.id}>
                                                <td>
                                                    <div className="ec-prop-cell">
                                                        <div className="ec-prop-avatar"><User size={14} /></div>
                                                        <div>
                                                            <div className="ec-prop-name">{prop?.nombre ?? '—'}</div>
                                                            <div className="ec-prop-apto">Apto {prop?.apartamento ?? '—'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className="ec-periodo-chip">{e.periodo}</span></td>
                                                <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#64748b', fontSize: '0.8rem' }}>
                                                    {e.archivo_nombre}
                                                </td>
                                                <td style={{ color: '#94a3b8', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                                    {new Date(e.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td>
                                                    <div className="ec-action-btns">
                                                        <a href={e.archivo_url} target="_blank" rel="noopener noreferrer">
                                                            <button className="ec-open-btn" title="Ver archivo"><ExternalLink size={13} /></button>
                                                        </a>
                                                        <button className="ec-del-btn" title="Eliminar" onClick={() => eliminar(e.id, e.archivo_url)}>
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </>
    )
}