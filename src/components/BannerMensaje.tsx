'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Megaphone } from 'lucide-react'

type Mensaje = { texto: string; estado: string }

export default function BannerMensaje() {
    const [mensajeActivo, setMensajeActivo] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const cargarMensaje = async () => {
            const { data } = await supabase
                .from('mensajes')
                .select('*')
                .eq('estado', 'activo')
                .order('creado_en', { ascending: false })
                .limit(1)
                .single()
            if (data) setMensajeActivo(data.texto)
        }
        cargarMensaje()

        const canal = supabase.channel('mensajes-en-vivo')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'mensajes' }, (payload) => {
                const nuevoMensaje = payload.new as Mensaje
                if (nuevoMensaje.estado === 'activo') setMensajeActivo(nuevoMensaje.texto)
                else setMensajeActivo(null)
            }).subscribe()

        return () => { supabase.removeChannel(canal) }
    }, [supabase])

    if (!mensajeActivo) return null

    return (
        <>
            <style>{`
        .banner-wrap {
          position: relative;
          overflow: hidden;
          background: white;
          border: 1px solid #ede9fe;
          border-radius: 1rem;
          box-shadow: 0 4px 20px -4px rgba(124,58,237,0.1);
          animation: bannerIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes bannerIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .banner-stripe {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, #7c3aed, #a78bfa);
          border-radius: 4px 0 0 4px;
        }

        .banner-inner {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem 1rem 1.5rem;
        }

        .banner-icon-wrap {
          flex-shrink: 0;
          width: 40px; height: 40px;
          border-radius: 10px;
          background: #f5f3ff;
          color: #7c3aed;
          display: flex; align-items: center; justify-content: center;
        }

        .banner-label {
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #7c3aed;
          margin-bottom: 2px;
        }

        .banner-text {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e1b4b;
          line-height: 1.45;
        }

        .banner-pulse {
          position: absolute;
          right: 1rem; top: 1rem;
          display: flex;
        }
        .banner-pulse-ring {
          position: absolute;
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #a78bfa;
          opacity: 0.6;
          animation: pingAnim 1.8s ease-in-out infinite;
        }
        .banner-pulse-dot {
          position: relative;
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #7c3aed;
        }
        @keyframes pingAnim {
          0%   { transform: scale(1);   opacity: 0.6; }
          70%  { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

            <div className="banner-wrap">
                <div className="banner-stripe" />
                <div className="banner-inner">
                    <div className="banner-icon-wrap">
                        <Megaphone size={20} strokeWidth={2} />
                    </div>
                    <div>
                        <div className="banner-label">Aviso Importante</div>
                        <p className="banner-text">{mensajeActivo}</p>
                    </div>
                </div>
                <div className="banner-pulse">
                    <div className="banner-pulse-ring" />
                    <div className="banner-pulse-dot" />
                </div>
            </div>
        </>
    )
}