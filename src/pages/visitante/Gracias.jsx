import { Link } from 'react-router-dom'
import { ArrowLeft, Leaf, RotateCcw } from 'lucide-react'
import { useConteo } from '../../lib/useConteo.js'
import Confeti from './Confeti.jsx'

// Pantalla final (RF-07). `resumen` ya viene calculado desde Visitante.jsx
// porque, para cuando llegamos aquí, la bitácora ya se cerró (pasó a
// "pendiente") y sus observaciones podrían dejar de estar disponibles de
// inmediato. Misma lógica de siempre — esto es solo el diseño (Tailwind).
// El número grande y el confeti (`.big`/`.confeti` en Visitante.css) se
// dejan tal cual: son el único momento de "delight" del recorrido — ver
// Confeti.jsx.
export default function Gracias({ resumen, textos, onNueva }) {
  const vistos = useConteo(resumen.vistos)
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5">
      <div className="entra relative flex h-24 items-end overflow-hidden rounded-2xl bg-gradient-to-br from-leaf to-leaf-deep p-5 shadow-[var(--shadow-leaf)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-20%,rgba(255,255,255,0.28),transparent_60%)]" />
        <span className="grid size-11 place-items-center rounded-xl bg-white/15 text-primary-foreground ring-1 ring-white/20 backdrop-blur-sm">
          <Leaf className="size-5" />
        </span>
      </div>

      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{textos.graciasEyebrow}</p>
        <h1 className="mt-1 font-display text-2xl text-ink sm:text-3xl">{textos.gracias(resumen.nombreVisitante)}</h1>
      </div>

      <div className="big entra">
        {vistos} / {resumen.total}
        <Confeti />
      </div>

      <p className="text-ink-soft">{textos.resumenTexto(resumen.vistos, resumen.total)}</p>

      <div className="flex flex-col gap-3 pb-2">
        <button
          type="button" onClick={onNueva}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-leaf bg-leaf-soft px-5 py-3.5 font-display font-semibold text-leaf-deep transition-colors hover:bg-leaf-soft/70"
        >
          <RotateCcw className="size-4" /> {textos.nuevaBitacora}
        </button>
        <Link to="/" className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-medium text-ink-soft">
          <ArrowLeft className="size-4" /> {textos.volverInicio}
        </Link>
      </div>
    </div>
  )
}
