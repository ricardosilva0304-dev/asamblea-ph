'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    Rocket,
    Megaphone,
    Trash2,
    Upload,
    AlertCircle,
    CheckCircle2,
    X
} from 'lucide-react'

export default function ControlProgramador() {
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

    const lanzarVotacion = async () => {
        if (!titulo.trim()) return mostrarNotificacion('error', 'El título es obligatorio')
        setCargando(true)
        try {
            let imagen_url = null
            if (archivo) {
                const fileName = `${Date.now()}-${archivo.name}`
                const { data: uploadData } = await supabase.storage.from('encuestas').upload(fileName, archivo)
                if (uploadData) {
                    const { data } = supabase.storage.from('encuestas').getPublicUrl(fileName)
                    imagen_url = data.publicUrl
                }
            }
            await supabase.from('preguntas').update({ estado: 'cerrada' }).eq('estado', 'activa')
            const { error } = await supabase.from('preguntas').insert({
                titulo, descripcion: desc, opciones: opciones.split(',').map(o => o.trim()),
                imagen_url, estado: 'activa'
            })
            if (error) throw error
            mostrarNotificacion('success', 'Encuesta publicada')
            setTitulo(''); setDesc(''); setArchivo(null)
        } catch (e) {
            mostrarNotificacion('error', 'Error al publicar')
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

    // Estilos comunes para los inputs
    const inputClass = "w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 outline-none focus:border-indigo-500 transition"

    return (
        <div className="space-y-8">
            {/* NOTIFICACION */}
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
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 rounded-xl bg-slate-900 text-white">
                            <Rocket size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Crear Encuesta</h2>
                            <p className="text-slate-500 text-sm">Control de votaciones en vivo</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Pregunta principal" className={inputClass} />
                        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción" className={`${inputClass} h-24`} />
                        <input type="text" value={opciones} onChange={e => setOpciones(e.target.value)} placeholder="Opciones (separadas por coma)" className={inputClass} />

                        <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition">
                            <Upload size={18} className="text-slate-400" />
                            <span className="text-sm text-slate-500 truncate">{archivo ? archivo.name : 'Subir imagen'}</span>
                            <input type="file" className="hidden" onChange={e => setArchivo(e.target.files?.[0] || null)} />
                        </label>

                        <div className="flex gap-4 pt-4">
                            <button onClick={lanzarVotacion} className="flex-1 py-3 px-4 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm">
                                {cargando ? 'Publicando...' : 'Lanzar Encuesta'}
                            </button>
                            <button onClick={cerrarVotacion} className="px-6 py-3 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>

                {/* MENSAJE */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 rounded-xl bg-amber-500 text-white">
                            <Megaphone size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Anuncio Global</h2>
                            <p className="text-slate-500 text-sm">Mensaje visible para todos</p>
                        </div>
                    </div>

                    <textarea value={textoMensaje} onChange={e => setTextoMensaje(e.target.value)} placeholder="Escribe el mensaje..." className={`${inputClass} h-52 mb-6`} />

                    <div className="flex gap-4">
                        <button onClick={publicarMensaje} className="flex-1 py-3 px-4 rounded-lg font-semibold bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm">
                            Publicar
                        </button>
                        <button onClick={() => supabase.from('mensajes').update({ estado: 'inactivo' }).eq('estado', 'activo')}
                            className="px-6 py-3 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition flex items-center justify-center">
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}