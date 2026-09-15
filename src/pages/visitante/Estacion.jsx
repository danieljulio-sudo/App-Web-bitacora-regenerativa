import { useState } from 'react'
import { ArrowLeft, Camera, Search, X } from 'lucide-react'
import { campo } from '../../i18n/textos.js'
import { colorPorCategoria } from '../../lib/colorPorCategoria.js'
import { crearHallazgo, eliminarHallazgo, guardarFoto } from '../../lib/bitacoraVisitante.js'
import { comprimirFoto } from '../../lib/foto.js'
import { urlPublica } from '../../lib/supabase.js'
import { cn } from '../../lib/utils.js'

// Indicadores de una sola estación (RF-03/RF-04). Misma idea que
// Estaciones.jsx pero un nivel más adentro. Al final se agrega "¿viste algo
// que no está aquí?" — el catálogo no puede cubrir todo lo que hay en la
// finca de entrada, así que esto deja que el recorrido mismo lo alimente;
// el admin revisa después y decide si pasa a ser un indicador oficial.
// Misma lógica de siempre — esto es solo el diseño (Tailwind).
export default function Estacion({ estacion, observaciones, bitacoraId, idioma, textos, onAbrir, onVolver }) {
  const [agregando, setAgregando] = useState(false)
  const [nombreLibre, setNombreLibre] = useState('')
  const [foto, setFoto] = useState(null)
  const [comprimiendo, setComprimiendo] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const hallazgos = observaciones.filter((o) => o.estacionId === estacion.id && !o.indicadorId)

  async function elegirFoto(e) {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    setComprimiendo(true)
    try {
      setFoto(await comprimirFoto(archivo))
    } finally {
      setComprimiendo(false)
    }
  }

  function cancelar() {
    setAgregando(false)
    setNombreLibre('')
    setFoto(null)
  }

  async function guardar() {
    if (!nombreLibre.trim()) return
    setGuardando(true)
    try {
      const id = await crearHallazgo(bitacoraId, estacion.id, nombreLibre.trim())
      if (foto) await guardarFoto(id, foto)
      cancelar()
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5">
      <button type="button" onClick={onVolver} className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-ink">
        <ArrowLeft className="size-3.5" /> {textos.volverALista}
      </button>

      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-leaf-deep">{campo(estacion, 'nombre', idioma)}</p>
        <h1 className="mt-1 font-display text-2xl text-ink sm:text-3xl">{campo(estacion, 'descripcion', idioma) || campo(estacion, 'nombre', idioma)}</h1>
      </div>

      <div className="flex flex-col gap-3">
        {estacion.indicadores.map((i) => {
          const o = observaciones.find((x) => x.indicadorId === i.id)
          return (
            <button
              key={i.id} type="button" onClick={() => onAbrir(i.id)}
              className="relative flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 text-left transition-[transform,box-shadow] duration-150 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl text-2xl" style={{ '--acento-local': colorPorCategoria(i.categoria) }}>
                {i.fotoPath ? (
                  <img src={urlPublica('catalogo', i.fotoPath)} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_30%_25%,var(--surface),var(--acento-local,var(--leaf-soft)))]">{i.emoji}</div>
                )}
                {o?.tieneFoto && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-0.5 rounded-full border border-line bg-surface px-1.5 py-0.5 text-[0.65rem] font-bold text-cacao">
                    <Camera className="size-2.5" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-bold text-ink">{campo(i, 'nombre', idioma)}</p>
                <p className="truncate text-sm text-muted-foreground">{campo(i, 'pista', idioma)}</p>
                {!o && <p className="mt-1 text-sm font-medium text-muted-foreground">{textos.tocaParaRegistrar}</p>}
                {o && (
                  <span className={cn('mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-medium', o.visto ? 'bg-leaf-soft text-leaf-deep' : 'bg-muted text-muted-foreground')}>
                    {!o.visto && textos.noVisto}
                    {o.visto && i.tipoMedicion === 'conteo' && textos.vistos(o.cantidad)}
                    {o.visto && i.tipoMedicion === 'escala' && `${o.escala} / 5`}
                    {o.visto && (i.tipoMedicion === 'si_no' || i.tipoMedicion === 'foto') && textos.visto}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-3 pb-2">
        {hallazgos.length > 0 && (
          <div className="flex flex-col gap-2">
            {hallazgos.map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5">
                <span className="truncate text-sm text-ink">🔍 {h.nombreLibre}</span>
                <button
                  type="button" onClick={() => eliminarHallazgo(h.id)} aria-label={textos.hallazgoEliminar}
                  className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-cacao"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {!agregando ? (
          <button
            type="button" onClick={() => setAgregando(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-surface px-5 py-3 font-medium text-ink-soft transition-colors hover:border-leaf/50"
          >
            <Search className="size-4" /> {textos.hallazgoAgregar}
          </button>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-surface p-4">
            <p className="font-display font-bold text-ink">{textos.hallazgoTitulo}</p>
            <p className="mt-1 text-sm text-muted-foreground">{textos.hallazgoTexto}</p>
            <input
              type="text" value={nombreLibre} onChange={(e) => setNombreLibre(e.target.value)}
              placeholder={textos.hallazgoPlaceholder} autoFocus
              className="mt-3 w-full rounded-xl border border-line bg-background px-4 py-3 text-ink outline-none transition-colors focus:border-leaf focus:ring-2 focus:ring-leaf/20"
            />
            <div className="mt-3">
              {foto && <img src={foto} alt="" className="mb-2 w-full rounded-lg border border-line" />}
              <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-background px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-leaf/40">
                <Camera className="size-4" />
                {comprimiendo ? textos.comprimiendo : foto ? textos.cambiarFoto : textos.tomarFoto}
                <input type="file" accept="image/*" capture="environment" onChange={elegirFoto} disabled={comprimiendo} className="hidden" />
              </label>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button" disabled={!nombreLibre.trim() || guardando} onClick={guardar}
                className="w-full rounded-xl bg-leaf px-5 py-3 font-display font-semibold text-primary-foreground shadow-[var(--shadow-leaf)] transition-colors hover:bg-leaf-deep disabled:opacity-40"
              >
                {guardando ? textos.enviando : textos.hallazgoGuardar}
              </button>
              <button type="button" onClick={cancelar} className="w-full rounded-xl border border-line bg-surface px-5 py-3 text-sm font-medium text-ink-soft">
                {textos.hallazgoCancelar}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
