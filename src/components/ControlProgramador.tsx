'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Rocket, Megaphone, Upload, AlertCircle, CheckCircle2, ChevronRight, X } from 'lucide-react'

export default function ControlProgramador({ encuestaAEditar, limpiarEdicion }: any) {
    const [titulo, setTitulo] = useState('')
    const [desc, setDesc] = useState('')
    const [opciones, setOpciones] = useState('')
    const [archivo, setArchivo] = useState<File | null>(null)
    const [textoMensaje, setTextoMensaje] = useState('')
    const [cargando, setCargando] = useState(false)
    const [notificacion, setNotificacion] = useState<{ tipo: 'success' | 'error', msg: string } | null>(null)

    const supabase = createClient()

    const mostrarNotificacion = (tipo: 'success' | 'error', msg: string) => {
        setNotificacion({ tipo, msg })
        setTimeout(() => setNotificacion(null), 3500)
    }

    useEffect(() => {
        if (encuestaAEditar) {
            setTitulo(encuestaAEditar.titulo)
            setDesc(encuestaAEditar.descripcion)
            setOpciones(encuestaAEditar.opciones.join(', '))
        } else {
            setTitulo(''); setDesc(''); setOpciones('')
        }
    }, [encuestaAEditar])

    const lanzarVotacion = async () => {
        const opcionesArray = opciones.split(',').map(o => o.trim()).filter(o => o !== '')

        if (!titulo.trim() || opcionesArray.length === 0) {
            return mostrarNotificacion('error', 'Título y opciones son obligatorios')
        }

        setCargando(true)
        try {
            let imagen_url = encuestaAEditar?.imagen_url || null

            if (archivo) {
                const fileName = `${Date.now()}-${archivo.name}`
                const { data: uploadData } = await supabase.storage.from('encuestas').upload(fileName, archivo)
                if (uploadData) {
                    const { data } = supabase.storage.from('encuestas').getPublicUrl(fileName)
                    imagen_url = data.publicUrl
                }
            }

            if (encuestaAEditar) {
                await supabase.from('preguntas').update({
                    titulo, descripcion: desc, opciones: opcionesArray, imagen_url
                }).eq('id', encuestaAEditar.id)
                mostrarNotificacion('success', 'Encuesta actualizada')
                limpiarEdicion()
            } else {
                await supabase.from('preguntas').update({ estado: 'cerrada' }).eq('estado', 'activa')
                await supabase.from('preguntas').insert({
                    titulo, descripcion: desc, opciones: opcionesArray, imagen_url, estado: 'activa'
                })
                mostrarNotificacion('success', 'Encuesta lanzada')
            }
            setTitulo(''); setDesc(''); setOpciones(''); setArchivo(null)
        } catch (e) {
            mostrarNotificacion('error', 'Error al procesar')
        } finally {
            setCargando(false)
        }
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

    const inputClass = "w-full px-5 py-4 rounded-xl bg-slate-50 border-0 focus:ring-2 focus:ring-indigo-500 transition text-slate-800"

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
                {/* FORM ENCUESTA */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-indigo-600 text-white"><Rocket size={24} /></div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900">{encuestaAEditar ? 'Editar Encuesta' : 'Nueva Encuesta'}</h2>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Panel de control</p>
                            </div>
                        </div>
                        {encuestaAEditar && <button onClick={limpiarEdicion} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>}
                    </div>

                    <div className="space-y-4">
                        <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título de la pregunta" className={inputClass} />
                        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción breve" className={`${inputClass} h-24`} />
                        <input type="text" value={opciones} onChange={e => setOpciones(e.target.value)} placeholder="Ej: Apruebo, No Apruebo, Abstención" className={`${inputClass} font-mono text-indigo-700`} />

                        <label className="flex items-center gap-3 px-5 py-4 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                            <Upload size={18} className="text-slate-400" />
                            <span className="text-sm text-slate-500">{archivo ? archivo.name : 'Subir nueva imagen'}</span>
                            <input type="file" className="hidden" onChange={e => setArchivo(e.target.files?.[0] || null)} />
                        </label>

                        <button onClick={lanzarVotacion} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
                            {cargando ? 'Procesando...' : (encuestaAEditar ? 'Actualizar Encuesta' : 'Lanzar Encuesta')}
                            {!cargando && <ChevronRight size={20} />}
                        </button>
                    </div>
                </div>

                {/* FORM MENSAJE */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 rounded-2xl bg-amber-500 text-white"><Megaphone size={24} /></div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Anuncio Global</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Mensaje en tiempo real</p>
                        </div>
                    </div>
                    <textarea value={textoMensaje} onChange={e => setTextoMensaje(e.target.value)} placeholder="Escribe el mensaje..." className={`${inputClass} h-40 mb-4`} />
                    <button onClick={publicarMensaje} className="w-full py-4 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition">Publicar Anuncio</button>
                </div>
            </div>
        </div>
    )
}