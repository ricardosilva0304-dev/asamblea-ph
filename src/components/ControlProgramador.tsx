'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    Rocket,
    Megaphone,
    Trash2,
    Upload,
    AlertCircle,
    CheckCircle2
} from 'lucide-react'

export default function ControlProgramador({ encuestaAEditar, limpiarEdicion }: any) {
    const [titulo, setTitulo] = useState('')
    const [desc, setDesc] = useState('')
    const [opciones, setOpciones] = useState('Si, No, Abstencion')
    const [archivo, setArchivo] = useState<File | null>(null)
    const [textoMensaje, setTextoMensaje] = useState('')
    const [cargando, setCargando] = useState(false)
    const [notificacion, setNotificacion] = useState<{
        tipo: 'success' | 'error'
        msg: string
    } | null>(null)

    const supabase = createClient()

    const mostrarNotificacion = (tipo: 'success' | 'error', msg: string) => {
        setNotificacion({ tipo, msg })
        setTimeout(() => setNotificacion(null), 3500)
    }

    // Efecto para rellenar el formulario al editar
    useEffect(() => {
        if (encuestaAEditar) {
            setTitulo(encuestaAEditar.titulo)
            setDesc(encuestaAEditar.descripcion)
            setOpciones(encuestaAEditar.opciones.join(', '))
        } else {
            setTitulo('')
            setDesc('')
            setOpciones('Si, No, Abstencion')
        }
    }, [encuestaAEditar])

    const lanzarVotacion = async () => {
        const opcionesArray = opciones.split(',').map(o => o.trim()).filter(o => o !== '')

        if (!titulo.trim()) return mostrarNotificacion('error', 'El título es obligatorio')
        if (opcionesArray.length === 0) return mostrarNotificacion('error', 'Debe haber al menos una opción')

        setCargando(true)
        try {
            let imagen_url = encuestaAEditar?.imagen_url || null // Mantener la anterior si existe

            if (archivo) {
                const fileName = `${Date.now()}-${archivo.name}`
                const { data: uploadData } = await supabase.storage.from('encuestas').upload(fileName, archivo)
                if (uploadData) {
                    const { data } = supabase.storage.from('encuestas').getPublicUrl(fileName)
                    imagen_url = data.publicUrl
                }
            }

            if (encuestaAEditar) {
                // UPDATE
                await supabase.from('preguntas').update({
                    titulo, descripcion: desc, opciones: opcionesArray, imagen_url
                }).eq('id', encuestaAEditar.id)
                mostrarNotificacion('success', 'Encuesta actualizada')
                limpiarEdicion()
            } else {
                // INSERT
                await supabase.from('preguntas').update({ estado: 'cerrada' }).eq('estado', 'activa')
                await supabase.from('preguntas').insert({
                    titulo, descripcion: desc, opciones: opcionesArray, imagen_url, estado: 'activa'
                })
                mostrarNotificacion('success', 'Encuesta lanzada')
            }

            setTitulo(''); setDesc(''); setArchivo(null)
        } catch (e) {
            mostrarNotificacion('error', 'Error al procesar')
        } finally {
            setCargando(false)
        }
    }

    const cerrarVotacion = async () => {
        setCargando(true)
        await supabase.from('preguntas').update({ estado: 'cerrada' }).eq('estado', 'activa')
        mostrarNotificacion('success', 'Votación cerrada')
        setCargando(false)
    }

    const publicarMensaje = async () => {
        if (!textoMensaje.trim()) return mostrarNotificacion('error', 'Escribe un mensaje')
        setCargando(true)
        await supabase.from('mensajes').update({ estado: 'inactivo' }).eq('estado', 'activo')
        await supabase.from('mensajes').insert({ texto: textoMensaje, estado: 'activo' })
        setTextoMensaje('')
        mostrarNotificacion('success', 'Mensaje publicado')
        setCargando(false)
    }

    const inputClass = "w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 outline-none focus:border-indigo-500 transition"

    return (
        <div className="space-y-8">
            {notificacion && (
                <div className={`fixed top-8 right-8 px-6 py-4 rounded-xl shadow-lg border flex items-center gap-3 z-50 text-sm font-medium
                    ${notificacion.tipo === 'success' ? 'bg-white border-emerald-200 text-emerald-700' : 'bg-white border-rose-200 text-rose-700'}`}>
                    {notificacion.tipo === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {notificacion.msg}
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
                {/* ENCUESTA */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-slate-900 text-white">
                                <Rocket size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{encuestaAEditar ? 'Editar Encuesta' : 'Crear Encuesta'}</h2>
                            </div>
                        </div>
                        {encuestaAEditar && <button onClick={limpiarEdicion} className="text-xs font-bold text-slate-400 hover:text-slate-900 uppercase">Cancelar</button>}
                    </div>

                    <div className="space-y-4">
                        <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Pregunta principal" className={inputClass} />
                        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción" className={`${inputClass} h-24`} />
                        <input type="text" value={opciones} onChange={e => setOpciones(e.target.value)} placeholder="Opciones (separadas por coma)" className={inputClass} />

                        <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition">
                            <Upload size={18} className="text-slate-400" />
                            <span className="text-sm text-slate-500 truncate">{archivo ? archivo.name : 'Subir nueva imagen'}</span>
                            <input type="file" className="hidden" onChange={e => setArchivo(e.target.files?.[0] || null)} />
                        </label>

                        <div className="flex gap-4 pt-4">
                            <button onClick={lanzarVotacion} className="flex-1 py-3 px-4 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm">
                                {cargando ? 'Procesando...' : (encuestaAEditar ? 'Guardar Cambios' : 'Lanzar Encuesta')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* MENSAJE (se mantiene igual) */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 rounded-xl bg-amber-500 text-white"><Megaphone size={24} /></div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Anuncio Global</h2>
                        </div>
                    </div>
                    <textarea value={textoMensaje} onChange={e => setTextoMensaje(e.target.value)} placeholder="Escribe el mensaje..." className={`${inputClass} h-52 mb-6`} />
                    <button onClick={publicarMensaje} className="w-full py-3 rounded-lg font-semibold bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm">Publicar</button>
                </div>
            </div>
        </div>
    )
}