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

    const inputClass = "w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 outline-none focus:border-slate-400 transition"
    const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1"

    return (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Agregar Propietario</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClass}>Usuario / Unidad</label>
                    <input name="usuario" type="text" required placeholder="Ej: apto101" className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Nombre Completo</label>
                    <input name="nombre" type="text" required placeholder="Ej: Juan Pérez" className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Coeficiente (%)</label>
                    <input name="coeficiente" type="number" step="0.0001" required className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Contraseña</label>
                    <input name="password" type="password" required className={inputClass} />
                </div>

                {mensaje && (
                    <div className={`md:col-span-2 p-4 rounded-lg text-sm font-medium ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {mensaje.texto}
                    </div>
                )}

                <button type="submit" disabled={cargando} className="md:col-span-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition">
                    {cargando ? 'Procesando...' : 'Guardar Nuevo Propietario'}
                </button>
            </form>
        </div>
    )
}