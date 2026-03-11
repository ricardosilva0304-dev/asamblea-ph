import ResultadosAdmin from '@/components/ResultadosAdmin'
import BannerMensaje from '@/components/BannerMensaje'
import FormCrearUsuario from '@/components/FormCrearUsuario'
import ListaPropietarios from '@/components/ListaPropietarios'

export default function AdminDashboard() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .admin-root {
          min-height: 100dvh;
          background: #f6f7fb;
          font-family: 'DM Sans', sans-serif;
        }

        .admin-topbar {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(226,232,240,0.8);
          padding: 0 1.5rem;
        }

        .admin-topbar-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
          gap: 1rem;
        }

        .admin-brand {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .admin-brand-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #7c3aed;
        }

        .admin-brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.3px;
        }

        .admin-brand-role {
          font-size: 0.7rem;
          font-weight: 600;
          color: #7c3aed;
          background: #f5f3ff;
          border: 1px solid #ede9fe;
          border-radius: 99px;
          padding: 2px 10px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .admin-live-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.7rem;
          font-weight: 600;
          color: #16a34a;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 99px;
          padding: 4px 12px;
        }

        .admin-live-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #16a34a;
          animation: livePulse 1.8s ease-in-out infinite;
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.7); }
        }

        .admin-main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .admin-page-header { }

        .admin-page-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.6rem, 4vw, 2.2rem);
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
          line-height: 1.15;
        }

        .admin-page-sub {
          font-size: 0.85rem;
          color: #94a3b8;
          margin-top: 0.3rem;
        }

        /* Section dividers */
        .admin-section-label {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: -0.5rem;
        }
        .admin-section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e8ecf2;
        }

        @media (max-width: 640px) {
          .admin-main { padding: 1.25rem 1rem 3rem; gap: 1.25rem; }
        }
      `}</style>

      <div className="admin-root">
        <header className="admin-topbar">
          <div className="admin-topbar-inner">
            <div className="admin-brand">
              <div className="admin-brand-dot" />
              <span className="admin-brand-name">Asamblea PH</span>
              <span className="admin-brand-role">Administrador</span>
            </div>
            <div className="admin-live-badge">
              <div className="admin-live-dot" />
              En vivo
            </div>
          </div>
        </header>

        <main className="admin-main">
          <div className="admin-page-header">
            <h1 className="admin-page-title">Mesa de Control</h1>
            <p className="admin-page-sub">Monitoreo de votaciones y gestión de propietarios en tiempo real</p>
          </div>

          <BannerMensaje />

          <div className="admin-section-label">📊 Resultados</div>
          <ResultadosAdmin />

          <div className="admin-section-label">👤 Propietarios</div>
          <FormCrearUsuario />
          <ListaPropietarios />
        </main>
      </div>
    </>
  )
}