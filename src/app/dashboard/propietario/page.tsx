import PreguntaEnVivo from '@/components/PreguntaEnVivo'
import BannerMensaje from '@/components/BannerMensaje'
import EstadoCuentaPropietario from '@/components/EstadoCuentaPropietario'

export default function PropietarioDashboard() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .prop-root {
          min-height: 100dvh;
          background: #f6f7fb;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── Top bar ── */
        .prop-topbar {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(226,232,240,0.7);
          padding: 0 1.25rem;
        }

        .prop-topbar-inner {
          max-width: 560px;
          margin: 0 auto;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .prop-topbar-brand {
          display: flex;
          align-items: center;
          gap: 0.55rem;
        }

        .prop-topbar-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #2563eb;
        }

        .prop-topbar-name {
          font-family: 'Syne', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.2px;
        }

        .prop-topbar-role {
          font-size: 0.65rem;
          font-weight: 600;
          color: #2563eb;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 99px;
          padding: 2px 9px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* ── Main scroll area ── */
        .prop-main {
          flex: 1;
          max-width: 560px;
          width: 100%;
          margin: 0 auto;
          padding: 1.5rem 1.25rem 5rem;
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        /* ── Hero card ── */
        .prop-hero {
          background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
          border-radius: 1.5rem;
          padding: 1.5rem;
          color: white;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 8px 30px rgba(37,99,235,0.28);
          animation: heroIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .prop-hero-icon {
          width: 52px; height: 52px;
          border-radius: 14px;
          background: rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-size: 1.5rem;
        }

        .prop-hero-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.3px;
          line-height: 1.2;
        }

        .prop-hero-sub {
          font-size: 0.78rem;
          opacity: 0.75;
          margin-top: 3px;
          font-weight: 400;
        }

        /* ── Section label ── */
        .prop-section-label {
          font-size: 0.63rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 0.25rem;
        }
        .prop-section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e8ecf2;
        }

        /* ── Footer ── */
        .prop-footer {
          text-align: center;
          font-size: 0.62rem;
          color: #cbd5e1;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 0 1rem 2rem;
          max-width: 560px;
          margin: 0 auto;
          width: 100%;
        }
      `}</style>

      <div className="prop-root">
        {/* TOP BAR */}
        <header className="prop-topbar">
          <div className="prop-topbar-inner">
            <div className="prop-topbar-brand">
              <div className="prop-topbar-dot" />
              <span className="prop-topbar-name">Asamblea PH</span>
            </div>
            <span className="prop-topbar-role">Propietario</span>
          </div>
        </header>

        {/* CONTENT */}
        <main className="prop-main">
          {/* Hero */}
          <div className="prop-hero">
            <div className="prop-hero-icon">🏛️</div>
            <div>
              <div className="prop-hero-title">Sala de Asamblea</div>
              <div className="prop-hero-sub">Votaciones en tiempo real</div>
            </div>
          </div>

          {/* Banner mensaje */}
          <BannerMensaje />

          {/* Votación */}
          <div className="prop-section-label">🗳️ Votación activa</div>
          <PreguntaEnVivo />

          {/* Estado de cuenta */}
          <div className="prop-section-label">📄 Estado de cuenta</div>
          <EstadoCuentaPropietario />
        </main>

        <div className="prop-footer">Asamblea PH © 2026 · Parque de las Flores</div>
      </div>
    </>
  )
}