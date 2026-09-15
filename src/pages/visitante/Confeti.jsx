const PARTICULAS = ['🌿', '🌼', '🐝', '✨', '🍃']

// Estalla una sola vez alrededor del número grande de "Gracias" — el único
// momento del recorrido que el visitante ve una vez, así que es donde vive
// el presupuesto de "delight" (ver skill de animación). Nada de esto se
// repite ni se puede disparar dos veces, así que usa animación (no
// transición) sin problema. Si el visitante pidió menos movimiento, no se
// monta nada — no hay una versión "más lenta" razonable para un estallido.
export default function Confeti() {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null

  const piezas = Array.from({ length: 10 }, (_, i) => {
    const angulo = (i / 10) * Math.PI * 2 + (i % 2 ? 0.2 : -0.15)
    const distancia = 70 + (i % 3) * 22
    return {
      simbolo: PARTICULAS[i % PARTICULAS.length],
      tx: Math.round(Math.cos(angulo) * distancia),
      ty: Math.round(Math.sin(angulo) * distancia),
      retraso: i * 18,
    }
  })

  return (
    <div className="confeti" aria-hidden="true">
      {piezas.map((p, i) => (
        <span key={i} className="confeti-pieza" style={{ '--tx': `${p.tx}px`, '--ty': `${p.ty}px`, animationDelay: `${p.retraso}ms` }}>
          {p.simbolo}
        </span>
      ))}
    </div>
  )
}
