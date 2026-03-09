import PreguntaEnVivo from '@/components/PreguntaEnVivo'
import BannerMensaje from '@/components/BannerMensaje'

export default function PropietarioDashboard() {
    return (
        <div className="max-w-lg mx-auto py-4 px-2">
            {/* Encabezado muy sencillo */}
            <div className="text-center mb-6">
                <h1 className="text-2xl font-extrabold text-slate-800">Sala de Votación</h1>
                <p className="text-slate-500 text-sm">Edificio y Asamblea PH</p>
            </div>

            <BannerMensaje />
            <PreguntaEnVivo />
        </div>
    )
}