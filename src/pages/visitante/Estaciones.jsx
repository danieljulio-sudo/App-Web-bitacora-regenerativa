import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, MapPin } from 'lucide-react'
import { campo } from '../../i18n/textos.js'
import { colorPorIndice } from '../../lib/colorPorCategoria.js'
import { urlPublica } from '../../lib/supabase.js'
import { cn } from '../../lib/utils.js'

// Lista de estaciones de la ruta (RF-03), cada una con su progreso. Es
// "tonta" a propósito: solo lee `observaciones` (que ya llegó reactivamente
// desde Dexie vía useLiveQuery en el padre) y pinta una tarjeta por
// estación. Misma lógica de siempre — esto es solo el diseño (Tailwind).
export default function Estaciones({ bitacora, estaciones, observaciones, idioma, textos, onAbrir, onTerminar }) {
  const totalIndicadores = estaciones.reduce((n, e) => n + e.indicadores.length, 0)
  const totalRespondidos = observaciones.length
  const porcentaje = totalIndicadores ? Math.round((totalRespondidos / totalIndicadores) * 100) : 0

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5">
      <Link to="/" className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-ink">
        <ArrowLeft className="size-3.5" /> {textos.volverInicio}
      </Link>

      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{textos.tuBitacora}</p>
        <h1 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
          {bitacora.nombreVisitante ? `${textos.tuBitacora}, ${bitacora.nombreVisitante}` : textos.tuBitacora}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background">
          <div
            className="h-full origin-left rounded-full bg-[linear-gradient(90deg,var(--leaf),var(--pollen))] transition-transform duration-300 ease-in-out"
            style={{ transform: `scaleX(${porcentaje / 100})` }}
          />
        </div>
        <span className="font-display text-sm font-bold tabular-nums text-muted-foreground">{totalRespondidos} / {totalIndicadores}</span>
      </div>

      <div className="flex flex-col gap-3">
        {estaciones.map((estacion, indice) => {
          const respondidosEstacion = observaciones.filter((o) => o.estacionId === estacion.id).length
          const completa = respondidosEstacion === estacion.indicadores.length
          return (
            <button
              key={estacion.id} type="button" onClick={() => onAbrir(estacion.id)}
              className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 text-left transition-[transform,box-shadow,border-color] duration-150 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              <div
                className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl text-2xl"
                style={{ '--acento-local': colorPorIndice(indice) }}
              >
                {estacion.fotoPath ? (
                  <img src={urlPublica('catalogo', estacion.fotoPath)} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_30%_25%,var(--surface),var(--acento-local,var(--leaf-soft)))]">
                    <MapPin className="size-6 text-ink-soft" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-bold text-ink">{campo(estacion, 'nombre', idioma)}</p>
                <p className="truncate text-sm text-muted-foreground">{campo(estacion, 'descripcion', idioma)}</p>
                <span className={cn('mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-medium', completa ? 'bg-leaf-soft text-leaf-deep' : 'bg-pollen-soft text-accent-foreground')}>
                  {respondidosEstacion} / {estacion.indicadores.length}
                </span>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          )
        })}
      </div>

      <button
        type="button" onClick={onTerminar}
        className="w-full rounded-xl bg-leaf px-5 py-3.5 font-display font-semibold text-primary-foreground shadow-[var(--shadow-leaf)] transition-[background-color,transform] duration-150 ease-out hover:bg-leaf-deep active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        {textos.terminarRecorrido}
      </button>
    </div>
  )
}
