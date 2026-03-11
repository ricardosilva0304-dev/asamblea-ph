'use client'

import { useState, useEffect } from 'react'

export default function Reloj() {
  const [fecha, setFecha] = useState<Date | null>(null)

  useEffect(() => {
    setFecha(new Date())
    const timer = setInterval(() => setFecha(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!fecha) return <div style={{ width: 90, height: 36 }} />

  const fechaStr = fecha.toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short'
  })

  const horaStr = fecha.toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })

  return (
    <>
      <style>{`
        .reloj-wrap {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 1.2;
          flex-shrink: 0;
        }

        .reloj-fecha {
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
        }

        .reloj-hora {
          font-family: 'Courier New', 'Courier', monospace;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: 0.04em;
          font-variant-numeric: tabular-nums;
        }

        @media (max-width: 480px) {
          .reloj-fecha { display: none; }
          .reloj-hora  { font-size: 0.85rem; }
        }
      `}</style>

      <div className="reloj-wrap">
        <span className="reloj-fecha">{fechaStr}</span>
        <span className="reloj-hora">{horaStr}</span>
      </div>
    </>
  )
}