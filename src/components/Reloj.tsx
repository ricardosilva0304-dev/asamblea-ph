'use client'
import { useState, useEffect } from 'react'

export default function Reloj() {
  const [fecha, setFecha] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setFecha(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="hidden md:flex flex-col items-end text-blue-200/50 mr-6">
      <span className="text-xs font-bold tracking-widest uppercase">
        {fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
      </span>
      <span className="text-lg font-mono font-bold text-white">
        {fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </div>
  )
}