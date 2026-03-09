import PreguntaEnVivo from '@/components/PreguntaEnVivo'
import BannerMensaje from '@/components/BannerMensaje'
import { Building2, Vote } from 'lucide-react'

export default function PropietarioDashboard() {
    return (
        <div className="max-w-xl mx-auto px-4 py-8 animate-in fade-in duration-700">

            {/* Encabezado Estilo "App" */}
            <div className="flex items-center gap-4 mb-10 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg shadow-indigo-200">
                    <Building2 size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sala de Asamblea</h1>
                    <p className="text-slate-500 font-medium">Panel de Votación en Tiempo Real</p>
                </div>
            </div>

            <div className="space-y-6">
                <BannerMensaje />

                {/* Sección de Votación */}
                <div className="flex items-center gap-2 mb-2">
                    <Vote className="text-indigo-600" size={20} />
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Estado de la Votación</h2>
                </div>

                <PreguntaEnVivo />
            </div>

            <div className="mt-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                Asamblea PH © 2026
            </div>
        </div>
    )
}