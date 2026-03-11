'use client'
import { useState } from 'react'
import ControlProgramador from "@/components/ControlProgramador"
import ListaEncuestas from "@/components/ListaEncuestas"
import EstadosCuenta from "@/components/EstadosCuenta"

type Tab = 'encuestas' | 'estados'

export default function ProgramadorDashboard() {
  const [encuestaParaEditar, setEncuestaParaEditar] = useState<any | null>(null)
  const [tab, setTab] = useState<Tab>('encuestas')

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .dash-root {
          min-height: 100dvh;
          background: #f6f7fb;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── TOP BAR ── */
        .topbar {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(226,232,240,0.8);
          padding: 0 1.5rem;
        }

        .topbar-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
          gap: 1rem;
        }

        .topbar-brand {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .brand-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #2563eb;
        }

        .brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.3px;
        }

        .brand-role {
          font-size: 0.7rem;
          font-weight: 600;
          color: #94a3b8;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 99px;
          padding: 2px 10px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* ── TABS ── */
        .tabs-bar {
          display: flex;
          gap: 0.25rem;
          background: #f1f5f9;
          border-radius: 12px;
          padding: 4px;
        }

        .tab-btn {
          padding: 0.45rem 1.1rem;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          border: none;
          cursor: pointer;
          transition: all 0.18s;
          background: transparent;
          color: #64748b;
          white-space: nowrap;
        }

        .tab-btn.active {
          background: white;
          color: #1e3a8a;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }

        /* ── MAIN ── */
        .dash-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.6rem, 4vw, 2.2rem);
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
          line-height: 1.15;
        }

        .page-subtitle {
          font-size: 0.85rem;
          color: #94a3b8;
          margin-top: 0.3rem;
          font-weight: 400;
        }

        /* ── PANEL FADE ── */
        .panel-fade {
          animation: panelIn 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes panelIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .brand-name { font-size: 0.92rem; }
          .dash-main { padding: 1.25rem 1rem 3rem; }
        }
      `}</style>

      <div className="dash-root">
        {/* TOP BAR */}
        <header className="topbar">
          <div className="topbar-inner">
            <div className="topbar-brand">
              <div className="brand-dot" />
              <span className="brand-name">Asamblea PH</span>
              <span className="brand-role">Programador</span>
            </div>
            <nav className="tabs-bar">
              <button
                className={`tab-btn ${tab === 'encuestas' ? 'active' : ''}`}
                onClick={() => setTab('encuestas')}
              >
                🗳️ Encuestas
              </button>
              <button
                className={`tab-btn ${tab === 'estados' ? 'active' : ''}`}
                onClick={() => setTab('estados')}
              >
                📄 Estados de Cuenta
              </button>
            </nav>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="dash-main">
          {tab === 'encuestas' && (
            <div className="panel-fade">
              <div className="page-header">
                <h1 className="page-title">Control Central</h1>
                <p className="page-subtitle">Gestiona votaciones y anuncios en tiempo real</p>
              </div>
              <ControlProgramador
                encuestaAEditar={encuestaParaEditar}
                limpiarEdicion={() => setEncuestaParaEditar(null)}
              />
              <div style={{ marginTop: '2rem' }}>
                <ListaEncuestas onEdit={(e: any) => setEncuestaParaEditar(e)} />
              </div>
            </div>
          )}

          {tab === 'estados' && (
            <div className="panel-fade">
              <div className="page-header">
                <h1 className="page-title">Estados de Cuenta</h1>
                <p className="page-subtitle">Sube y gestiona los documentos por propietario</p>
              </div>
              <EstadosCuenta />
            </div>
          )}
        </main>
      </div>
    </>
  )
}