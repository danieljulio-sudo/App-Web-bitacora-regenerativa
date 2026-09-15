import { useEffect, useState } from 'react'

// Cuenta de 0 hasta `valorFinal` en `duracionMs`, con una curva ease-out
// (arranca rápido, llega despacio — se siente más vivo que un conteo lineal).
// Solo se usa en la pantalla de "Gracias": es la única pantalla que el
// visitante ve una sola vez por recorrido, así que es donde vive el
// "presupuesto de delight" (ver skill de animación) — en cualquier pantalla
// que se repite muchas veces por día, esto sobraría.
//
// Respeta prefers-reduced-motion: en vez de animar, salta directo al valor
// final.
export function useConteo(valorFinal, duracionMs = 900) {
  const [valor, setValor] = useState(0)

  useEffect(() => {
    const prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefiereMenosMovimiento || valorFinal === 0) {
      setValor(valorFinal)
      return
    }

    let cuadro
    const inicio = performance.now()
    const easeOut = (t) => 1 - Math.pow(1 - t, 3)

    function paso(ahora) {
      const progreso = Math.min(1, (ahora - inicio) / duracionMs)
      setValor(Math.round(valorFinal * easeOut(progreso)))
      if (progreso < 1) cuadro = requestAnimationFrame(paso)
    }
    cuadro = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(cuadro)
  }, [valorFinal, duracionMs])

  return valor
}
