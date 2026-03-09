import PreguntaEnVivo from '@/components/PreguntaEnVivo'
import BannerMensaje from '@/components/BannerMensaje' // IMPORTAR ESTO

export default function PropietarioDashboard() {
    return (
        <div className="max-w-3xl mx-auto p-6 mt-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Panel del Propietario</h1>
                <p className="text-gray-600 mt-2">
                    Bienvenido a la asamblea. Por favor, mantén esta pantalla abierta.
                    Las votaciones aparecerán aquí automáticamente.
                </p>
            </div>

            <BannerMensaje /> {/* AÑADIR AQUÍ */}

            <PreguntaEnVivo />
        </div>
    )
}