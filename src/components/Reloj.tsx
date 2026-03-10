'use client'

import { useState, useEffect } from 'react'

export default function Reloj() {
  // Inicializamos en null para que el servidor y el cliente tengan el mismo valor inicial
  const [fecha, setFecha] = useState<Date | null>(null)

  useEffect(() => {
    // Esto solo corre en el cliente
    setFecha(new Date())

    const timer = setInterval(() => {
      setFecha(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Mientras no haya fecha (durante la carga inicial), mostramos algo vacío o un placeholder
  if (!fecha) {
    return <div className="h-10"></div> // O un esqueleto de carga
  }

  return (
    <div className="flex flex-col items-end text-slate-400">
      <span className="hidden md:block text-[10px] uppercase tracking-widest font-bold">
        {fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
      </span>
      <span className="text-sm font-mono font-bold text-white">
        {fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </div>
  )
}