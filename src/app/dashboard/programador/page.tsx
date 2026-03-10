'use client'
import { useState } from 'react'
import ControlProgramador from "@/components/ControlProgramador"
import ListaEncuestas from "@/components/ListaEncuestas"

export default function ProgramadorDashboard() {
  const [encuestaParaEditar, setEncuestaParaEditar] = useState<any | null>(null)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900">Control Central</h1>
        </header>

        {/* Pasamos el estado para que el formulario sepa qué editar */}
        <ControlProgramador
          encuestaAEditar={encuestaParaEditar}
          limpiarEdicion={() => setEncuestaParaEditar(null)}
        />

        {/* Pasamos la función para que la lista le diga al formulario qué editar */}
        <ListaEncuestas onEdit={(e: any) => setEncuestaParaEditar(e)} />
      </div>
    </div>
  )
}