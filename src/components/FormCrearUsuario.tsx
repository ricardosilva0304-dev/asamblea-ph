'use client'

import { useState } from 'react'
import { crearPropietario } from '@/app/dashboard/admin/accionesAdmin'

export default function FormCrearUsuario() {
    const [mensaje, setMensaje] = useState<{ texto: string, tipo: 'error' | 'exito' } | null>(null)
    const [cargando, setCargando] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setCargando(true)
        setMensaje(null)

        const formData = new FormData(e.currentTarget)

        // Llamamos a nuestra Server Action segura
        const respuesta = await crearPropietario(formData)

        if (respuesta.error) {
            setMensaje({ texto: respuesta.error, tipo: 'error' })
        } else if (respuesta.success) {
            setMensaje({ texto: respuesta.mensaje!, tipo: 'exito' })
                // Limpiamos el formulario
                ; (e.target as HTMLFormElement).reset()
        }

        setCargando(false)
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                👤 Agregar Nuevo Propietario
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuario / Unidad</label>
                    <input
                        name="usuario" type="text" required placeholder="Ej: apto101"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <input
                        name="nombre" type="text" required placeholder="Ej: Juan Pérez"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coeficiente (%)</label>
                    <input
                        name="coeficiente" type="number" step="0.0001" min="0" required placeholder="Ej: 2.54"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input
                        name="password" type="password" required placeholder="Mínimo 6 caracteres" minLength={6}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                {mensaje && (
                    <div className={`md:col-span-2 p-3 rounded-lg text-sm font-medium ${mensaje.tipo === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {mensaje.texto}
                    </div>
                )}

                <div className="md:col-span-2 mt-2">
                    <button
                        type="submit" disabled={cargando}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                    >
                        {cargando ? 'Creando...' : 'Crear Propietario'}
                    </button>
                </div>
            </form>
        </div>
    )
}