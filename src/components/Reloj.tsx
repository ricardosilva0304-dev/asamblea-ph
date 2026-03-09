'use client'

import { useState, useEffect } from 'react'

export default function Reloj() {

  const [fecha, setFecha] = useState(new Date())

  useEffect(() => {

    const timer = setInterval(() => {

      setFecha(new Date())

    }, 1000)

    return () => clearInterval(timer)

  }, [])

  return (

    <div className="flex flex-col items-end text-xs sm:text-sm text-slate-400 font-mono">

      <span className="hidden md:block uppercase tracking-widest">

        {fecha.toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        })}

      </span>

      <span className="text-sm sm:text-base font-bold text-white">

        {fecha.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })}

      </span>

    </div>

  )

}