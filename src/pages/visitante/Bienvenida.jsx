import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { PAISES } from '../../i18n/textos.js'
import { colorPorCategoria } from '../../lib/colorPorCategoria.js'
import { urlPublica } from '../../lib/supabase.js'
import { cn } from '../../lib/utils.js'

// Primera pantalla: idioma, nombre, país y correo opcional (RF-01, RF-02).
// No toca la base de datos — solo junta los datos y avisa al padre
// (Visitante.jsx) para que él cree la bitácora. Misma lógica de siempre;
// esto es solo el diseño (Tailwind, como guía/panel), llevado al lenguaje
// visual del prototipo. La animación de entrada de la franja de íconos
// reusa `.entra`/`@keyframes aparecer` de index.css (ya gestiona
// prefers-reduced-motion) en vez de inventar una nueva.
export default function Bienvenida({ ruta, indicadores, idioma, setIdioma, textos, onIniciar }) {
  const [nombre, setNombre] = useState('')
  const [pais, setPais] = useState(PAISES[0])
  const [correo, setCorreo] = useState('')

  function empezar() {
    const limpio = nombre.trim()
    if (!limpio) return
    onIniciar({ nombreVisitante: limpio, pais, correo: correo.trim() })
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-ink">
          <ArrowLeft className="size-3.5" /> {textos.volverInicio}
        </Link>
        <div className="flex gap-1 rounded-full bg-background p-1" role="group" aria-label={textos.idioma}>
          {['es', 'en'].map((lng) => (
            <button
              key={lng} type="button" aria-pressed={idioma === lng} onClick={() => setIdioma(lng)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-display font-bold uppercase transition-colors duration-150',
                idioma === lng ? 'bg-ink text-paper' : 'text-muted-foreground',
              )}
            >
              {lng}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{ruta.nombre}</p>
        <h1 className="mt-1 font-display text-2xl text-ink sm:text-3xl">{textos.bienvenidaTitulo}</h1>
        <p className="mt-2 text-ink-soft">{textos.bienvenidaTexto}</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {indicadores.map((i, indice) => (
          <div
            key={i.id}
            className="entra aspect-square overflow-hidden rounded-xl border border-line"
            style={{ '--acento-local': colorPorCategoria(i.categoria), animationDelay: `${Math.min(indice, 4) * 40}ms` }}
            title={idioma === 'en' ? i.nombre_en || i.nombre_es : i.nombre_es}
            aria-hidden="true"
          >
            {i.fotoPath ? (
              <img src={urlPublica('catalogo', i.fotoPath)} alt="" className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_30%_25%,var(--surface),var(--acento-local,var(--leaf-soft)))] text-2xl">
                {i.emoji}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3.5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">{textos.nombreLabel}</span>
          <input
            id="nombre" type="text" autoComplete="given-name" placeholder={textos.nombrePlaceholder}
            value={nombre} onChange={(e) => setNombre(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink outline-none transition-colors focus:border-leaf focus:ring-2 focus:ring-leaf/20"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">{textos.paisLabel}</span>
          <select
            id="pais" value={pais} onChange={(e) => setPais(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink outline-none transition-colors focus:border-leaf focus:ring-2 focus:ring-leaf/20"
          >
            {PAISES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">{textos.correoLabel}</span>
          <input
            id="correo" type="email" autoComplete="email" placeholder={textos.correoPlaceholder}
            value={correo} onChange={(e) => setCorreo(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink outline-none transition-colors focus:border-leaf focus:ring-2 focus:ring-leaf/20"
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 pb-2">
        <button
          type="button" disabled={!nombre.trim()} onClick={empezar}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-leaf px-5 py-3.5 font-display font-semibold text-primary-foreground shadow-[var(--shadow-leaf)] transition-[background-color,transform] duration-150 ease-out hover:bg-leaf-deep active:scale-[0.98] disabled:opacity-40 motion-reduce:transition-none motion-reduce:active:scale-100"
        >
          {textos.empezar} <ArrowRight className="size-4" />
        </button>
        <p className="text-center text-sm text-muted-foreground">{textos.sinSenal}</p>
      </div>
    </div>
  )
}
