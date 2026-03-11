import { cerrarSesion } from '@/app/accionesAuth'
import { createClient } from '@/utils/supabase/server'
import { LogOut, Building2 } from 'lucide-react'
import Reloj from './Reloj'

const ROL_COLORS: Record<string, { bg: string; color: string; border: string }> = {
    programador: { bg: '#eff6ff', color: '#2563eb', border: '#dbeafe' },
    administrador: { bg: '#f5f3ff', color: '#7c3aed', border: '#ede9fe' },
    propietario: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
}

export default async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let perfil = { nombre: 'Usuario', usuario: '', rol: '' }
    if (user) {
        const { data } = await supabase.from('perfiles').select('nombre, usuario, rol').eq('id', user.id).single()
        if (data) perfil = data
    }

    const rolStyle = ROL_COLORS[perfil.rol] ?? { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' }

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .nb-root {
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(226,232,240,0.8);
          font-family: 'DM Sans', sans-serif;
        }

        .nb-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.25rem;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        /* ── Brand ── */
        .nb-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-shrink: 0;
        }

        .nb-brand-icon {
          width: 34px; height: 34px;
          border-radius: 9px;
          background: #0f172a;
          color: white;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .nb-brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.3px;
          white-space: nowrap;
        }

        /* ── Right cluster ── */
        .nb-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        /* ── Divider ── */
        .nb-div {
          width: 1px;
          height: 24px;
          background: #e2e8f0;
          flex-shrink: 0;
        }

        /* ── User info ── */
        .nb-user {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 1.2;
        }

        .nb-user-name {
          font-size: 0.82rem;
          font-weight: 600;
          color: #0f172a;
          white-space: nowrap;
          max-width: 160px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nb-rol-chip {
          display: inline-flex;
          align-items: center;
          padding: 1px 7px;
          border-radius: 99px;
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border: 1px solid;
          margin-top: 2px;
        }

        /* ── Logout ── */
        .nb-logout {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.9rem;
          border-radius: 9px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          color: #334155;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .nb-logout:hover {
          background: #fee2e2;
          border-color: #fecaca;
          color: #dc2626;
        }

        /* Hide user info on small screens */
        @media (max-width: 480px) {
          .nb-user { display: none; }
          .nb-div  { display: none; }
          .nb-brand-name { font-size: 0.9rem; }
          .nb-logout span { display: none; }
          .nb-logout { padding: 0.45rem 0.65rem; }
        }
      `}</style>

            <nav className="nb-root">
                <div className="nb-inner">
                    {/* BRAND */}
                    <div className="nb-brand">
                        <div className="nb-brand-icon">
                            <Building2 size={18} strokeWidth={2.5} />
                        </div>
                        <span className="nb-brand-name">Asamblea PH</span>
                    </div>

                    {/* RIGHT */}
                    <div className="nb-right">
                        <Reloj />

                        <div className="nb-div" />

                        {/* User info */}
                        <div className="nb-user">
                            <span className="nb-user-name">{perfil.nombre || perfil.usuario}</span>
                            {perfil.rol && (
                                <span
                                    className="nb-rol-chip"
                                    style={{
                                        background: rolStyle.bg,
                                        color: rolStyle.color,
                                        borderColor: rolStyle.border
                                    }}
                                >
                                    {perfil.rol}
                                </span>
                            )}
                        </div>

                        {/* Logout */}
                        <form action={cerrarSesion}>
                            <button type="submit" className="nb-logout">
                                <LogOut size={15} />
                                <span>Salir</span>
                            </button>
                        </form>
                    </div>
                </div>
            </nav>
        </>
    )
}