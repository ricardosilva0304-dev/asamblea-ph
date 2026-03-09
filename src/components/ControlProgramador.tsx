'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Rocket, Megaphone, Trash2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ControlProgramador() {
    // Estados para Encuesta
    const [titulo, setTitulo] = useState('')
    const [desc, setDesc] = useState('')
    const [opciones, setOpciones] = useState('Si, No, Abstencion')
    const [archivo, setArchivo] = useState<File | null>(null)

    // Estados para Mensajes
    const [textoMensaje, setTextoMensaje] = useState('')

    // Estados de UI
    const [cargando, setCargando] = useState(false)
    const [notificacion, setNotificacion] = useState<{ tipo: 'success' | 'error', msg: string } | null>(null)

    const supabase = createClient()

    const mostrarNotificacion = (tipo: 'success' | 'error', msg: string) => {
        setNotificacion({ tipo, msg })
        setTimeout(() => setNotificacion(null), 3000)
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
                titulo,
                descripcion: desc,
                opciones: opciones.split(',').map(o => o.trim()),
                imagen_url,
                estado: 'activa'
            })

            if (error) throw error
            mostrarNotificacion('success', '¡Encuesta lanzada correctamente!')
            setTitulo(''); setDesc(''); setArchivo(null)
        } catch (e) {
            mostrarNotificacion('error', 'Error al lanzar la encuesta')
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
        mostrarNotificacion('success', 'Anuncio publicado')
        setCargando(false)
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Notificaciones */}
            {notificacion && (
                <div className={`fixed top-20 right-6 p-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-right ${notificacion.tipo === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                    {notificacion.tipo === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="font-bold">{notificacion.msg}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* TARJETA VOTACIONES */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/20">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-indigo-600 p-3 rounded-2xl text-white"><Rocket size={24} /></div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Configurar Votación</h2>
                            <p className="text-slate-400 text-sm">Gestiona la participación en tiempo real</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <input type="text" placeholder="Pregunta principal" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                        <textarea placeholder="Descripción detallada (opcional)" value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 h-28 transition-all" />
                        <input type="text" placeholder="Opciones (Ej: Si, No, Abstencion)" value={opciones} onChange={(e) => setOpciones(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />

                        <label className="flex items-center gap-4 border-2 border-dashed border-slate-200 rounded-2xl p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                            <Upload className="text-slate-400" />
                            <span className="text-sm font-bold text-slate-500 truncate">{archivo ? archivo.name : "Subir imagen ilustrativa (Opcional)"}</span>
                            <input type="file" className="hidden" onChange={(e) => setArchivo(e.target.files?.[0] || null)} />
                        </label>

                        <div className="flex gap-4 pt-4">
                            <button onClick={lanzarVotacion} disabled={cargando} className="flex-[2] bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-600/20">
                                {cargando ? 'Publicando...' : 'Lanzar Encuesta'}
                            </button>
                            <button onClick={cerrarVotacion} className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all">Cerrar</button>
                        </div>
                    </div>
                </div>

                {/* TARJETA ANUNCIOS */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/20">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-amber-500 p-3 rounded-2xl text-white"><Megaphone size={24} /></div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Emitir Anuncio</h2>
                            <p className="text-slate-400 text-sm">Mensaje flotante para todos los usuarios</p>
                        </div>
                    </div>

                    <textarea value={textoMensaje} onChange={(e) => setTextoMensaje(e.target.value)} placeholder="Escribe el anuncio aquí..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 h-64 mb-6 transition-all" />

                    <div className="flex gap-4">
                        <button onClick={publicarMensaje} className="flex-[2] bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all">Publicar Mensaje</button>
                        <button onClick={() => supabase.from('mensajes').update({ estado: 'inactivo' }).eq('estado', 'activo')} className="flex-1 bg-rose-50 text-rose-500 font-bold py-4 rounded-2xl hover:bg-rose-100 transition-all flex justify-center"><Trash2 size={20} /></button>
                    </div>
                </div>
            </div>
        </div>
    )
}