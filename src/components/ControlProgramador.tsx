'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    Rocket,
    Megaphone,
    Trash2,
    Upload,
    AlertCircle,
    CheckCircle2
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

        if (!titulo.trim()) {
            return mostrarNotificacion('error', 'El título es obligatorio')
        }

        setCargando(true)

        try {

            let imagen_url = null

            if (archivo) {

                const fileName = `${Date.now()}-${archivo.name}`

                const { data: uploadData } = await supabase
                    .storage
                    .from('encuestas')
                    .upload(fileName, archivo)

                if (uploadData) {

                    const { data } = supabase
                        .storage
                        .from('encuestas')
                        .getPublicUrl(fileName)

                    imagen_url = data.publicUrl

                }

            }

            await supabase
                .from('preguntas')
                .update({ estado: 'cerrada' })
                .eq('estado', 'activa')

            const { error } = await supabase
                .from('preguntas')
                .insert({
                    titulo,
                    descripcion: desc,
                    opciones: opciones.split(',').map(o => o.trim()),
                    imagen_url,
                    estado: 'activa'
                })

            if (error) throw error

            mostrarNotificacion('success', 'Encuesta publicada')

            setTitulo('')
            setDesc('')
            setArchivo(null)

        } catch (e) {

            mostrarNotificacion('error', 'Error al publicar')

        } finally {

            setCargando(false)

        }

    }

    const cerrarVotacion = async () => {

        setCargando(true)

        await supabase
            .from('preguntas')
            .update({ estado: 'cerrada' })
            .eq('estado', 'activa')

        mostrarNotificacion('success', 'Votación cerrada')

        setCargando(false)

    }

    const publicarMensaje = async () => {

        if (!textoMensaje.trim()) {
            return mostrarNotificacion('error', 'Escribe un mensaje')
        }

        setCargando(true)

        await supabase
            .from('mensajes')
            .update({ estado: 'inactivo' })
            .eq('estado', 'activo')

        await supabase
            .from('mensajes')
            .insert({
                texto: textoMensaje,
                estado: 'activo'
            })

        setTextoMensaje('')

        mostrarNotificacion('success', 'Mensaje publicado')

        setCargando(false)

    }

    return (

        <div className="max-w-7xl mx-auto space-y-10">

            {/* NOTIFICACION */}

            {notificacion && (

                <div className={`fixed top-24 right-8 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border text-sm flex items-center gap-3 z-50
${notificacion.tipo === 'success'
                        ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                        : 'bg-rose-500/20 border-rose-400/30 text-rose-300'
                    }`}>

                    {notificacion.tipo === 'success'
                        ? <CheckCircle2 size={18} />
                        : <AlertCircle size={18} />
                    }

                    {notificacion.msg}

                </div>

            )}

            <div className="grid lg:grid-cols-2 gap-10">

                {/* ENCUESTA */}

                <div className="relative group">

                    <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-3xl blur opacity-30 group-hover:opacity-70 transition"></div>

                    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">

                        <div className="flex items-center gap-4 mb-8">

                            <div className="p-3 rounded-xl bg-indigo-600 text-white shadow-lg">
                                <Rocket size={24} />
                            </div>

                            <div>

                                <h2 className="text-2xl font-bold text-white">
                                    Crear Encuesta
                                </h2>

                                <p className="text-slate-400 text-sm">
                                    Control de votaciones en vivo
                                </p>

                            </div>

                        </div>

                        <div className="space-y-5">

                            <input
                                type="text"
                                value={titulo}
                                onChange={e => setTitulo(e.target.value)}
                                placeholder="Pregunta principal"
                                className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-indigo-400"
                            />

                            <textarea
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                                placeholder="Descripción"
                                className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/10 text-white outline-none h-28"
                            />

                            <input
                                type="text"
                                value={opciones}
                                onChange={e => setOpciones(e.target.value)}
                                placeholder="Opciones"
                                className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/10 text-white outline-none"
                            />

                            <label className="flex items-center gap-4 px-4 py-4 border border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/5 transition">

                                <Upload size={18} />

                                <span className="text-sm text-slate-300 truncate">
                                    {archivo ? archivo.name : 'Subir imagen'}
                                </span>

                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={e => setArchivo(e.target.files?.[0] || null)}
                                />

                            </label>

                            <div className="flex gap-4 pt-3">

                                <button
                                    onClick={lanzarVotacion}
                                    className="flex-1 py-4 rounded-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:opacity-90 transition shadow-lg"
                                >

                                    {cargando ? 'Publicando...' : 'Lanzar Encuesta'}

                                </button>

                                <button
                                    onClick={cerrarVotacion}
                                    className="px-6 py-4 rounded-xl font-bold bg-white/10 hover:bg-white/20 transition"
                                >

                                    Cerrar

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

                {/* MENSAJE */}

                <div className="relative group">

                    <div className="absolute -inset-[1px] bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400 rounded-3xl blur opacity-30 group-hover:opacity-70 transition"></div>

                    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">

                        <div className="flex items-center gap-4 mb-8">

                            <div className="p-3 rounded-xl bg-amber-500 text-white shadow-lg">
                                <Megaphone size={24} />
                            </div>

                            <div>

                                <h2 className="text-2xl font-bold text-white">
                                    Anuncio Global
                                </h2>

                                <p className="text-slate-400 text-sm">
                                    Mensaje visible para todos
                                </p>

                            </div>

                        </div>

                        <textarea
                            value={textoMensaje}
                            onChange={e => setTextoMensaje(e.target.value)}
                            placeholder="Escribe el mensaje..."
                            className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/10 text-white outline-none h-56 mb-6"
                        />

                        <div className="flex gap-4">

                            <button
                                onClick={publicarMensaje}
                                className="flex-1 py-4 rounded-xl font-bold bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400 hover:opacity-90 transition shadow-lg"
                            >

                                Publicar

                            </button>

                            <button
                                onClick={() => supabase
                                    .from('mensajes')
                                    .update({ estado: 'inactivo' })
                                    .eq('estado', 'activo')
                                }
                                className="px-6 py-4 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-300 hover:bg-rose-500/30 transition flex items-center justify-center"
                            >

                                <Trash2 size={18} />

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    )
}