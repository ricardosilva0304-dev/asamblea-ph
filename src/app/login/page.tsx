import { login } from './actions'
import { Lock, User } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params?.error

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          font-family: 'DM Sans', sans-serif;
          background-color: #f0f4f8;
          background-image:
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(147, 197, 253, 0.35) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 80%, rgba(165, 180, 252, 0.25) 0%, transparent 60%),
            url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23cbd5e1' fill-opacity='0.3'/%3E%3C/svg%3E");
          position: relative;
        }

        .card {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 2rem;
          padding: 2.5rem 2rem;
          width: 100%;
          max-width: 420px;
          box-shadow:
            0 4px 6px -1px rgba(0,0,0,0.04),
            0 20px 60px -10px rgba(100, 120, 180, 0.18),
            0 0 0 1px rgba(255,255,255,0.6) inset;
          animation: cardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Header ── */
        .header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2.25rem;
          text-align: center;
          animation: fadeUp 0.5s 0.1s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .logo-wrap {
          width: 80px;
          height: 80px;
          border-radius: 22px;
          background: white;
          border: 1.5px solid rgba(203, 213, 225, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
          box-shadow: 0 4px 16px rgba(100, 120, 180, 0.12), 0 1px 3px rgba(0,0,0,0.06);
          overflow: hidden;
          padding: 10px;
        }

        .logo-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .divider-line {
          width: 32px;
          height: 2px;
          background: linear-gradient(90deg, #3b82f6, #818cf8);
          border-radius: 99px;
          margin: 0.65rem auto 0.5rem;
        }

        .title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.85rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.5px;
          line-height: 1.15;
        }

        .subtitle {
          font-size: 0.78rem;
          color: #94a3b8;
          font-weight: 400;
          letter-spacing: 0.02em;
          margin-top: 0.35rem;
          line-height: 1.5;
        }

        /* ── Form ── */
        .form { display: flex; flex-direction: column; gap: 1.1rem; }

        .field-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          animation: fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .field-wrap:nth-child(1) { animation-delay: 0.15s; }
        .field-wrap:nth-child(2) { animation-delay: 0.22s; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        label {
          font-size: 0.68rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-left: 0.25rem;
        }

        .input-wrap { position: relative; }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
          transition: color 0.2s;
          display: flex;
        }

        input {
          width: 100%;
          padding: 0.9rem 1rem 0.9rem 3rem;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
          appearance: none;
        }

        input:focus {
          background: #fff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        input:focus ~ .input-icon,
        .input-wrap:focus-within .input-icon {
          color: #3b82f6;
        }

        /* ── Error ── */
        .error-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 0.8rem 1rem;
          border-radius: 12px;
          font-size: 0.85rem;
          text-align: center;
          font-weight: 500;
          animation: fadeUp 0.3s ease both;
        }

        /* ── Button ── */
        .btn-submit {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.35);
          letter-spacing: 0.01em;
          margin-top: 0.4rem;
          animation: fadeUp 0.5s 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
          -webkit-appearance: none;
          appearance: none;
        }

        .btn-submit:hover {
          filter: brightness(1.06);
          box-shadow: 0 6px 28px rgba(59, 130, 246, 0.45);
          transform: translateY(-1px);
        }

        .btn-submit:active {
          transform: scale(0.985) translateY(0);
          filter: brightness(0.97);
        }

        /* ── Footer ── */
        .card-footer {
          margin-top: 1.75rem;
          text-align: center;
          animation: fadeUp 0.5s 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .footer-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-bottom: 0.5rem;
        }

        .dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #cbd5e1;
        }

        .footer-text {
          font-size: 0.67rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 500;
        }

        /* ── Mobile tweaks ── */
        @media (max-width: 400px) {
          .card { padding: 2rem 1.5rem; border-radius: 1.5rem; }
          .title { font-size: 1.65rem; }
        }
      `}</style>

      <div className="login-root">
        <div className="card">
          <div className="header">
            <div className="logo-wrap">
              <img src="/logo.png" alt="Parque de las Flores" />
            </div>
            <div className="title">Asamblea PH</div>
            <div className="divider-line" />
            <div className="subtitle">Agrupación Residencial<br />El Parque de las Flores</div>
          </div>

          <form className="form">
            <div className="field-wrap">
              <label htmlFor="usuario">Usuario</label>
              <div className="input-wrap">
                <span className="input-icon"><User size={18} /></span>
                <input id="usuario" name="usuario" type="text" required autoComplete="username" />
              </div>
            </div>

            <div className="field-wrap">
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrap">
                <span className="input-icon"><Lock size={18} /></span>
                <input id="password" name="password" type="password" required autoComplete="current-password" />
              </div>
            </div>

            {error && (
              <div className="error-box" role="alert">{error}</div>
            )}

            <button type="submit" formAction={login} className="btn-submit">
              Entrar a la Sesión
            </button>
          </form>

          <div className="card-footer">
            <div className="footer-dots">
              <div className="dot" /><div className="dot" /><div className="dot" />
            </div>
            <div className="footer-text">Seguridad Privada · Asamblea PH 2026</div>
          </div>
        </div>
      </div>
    </>
  )
}