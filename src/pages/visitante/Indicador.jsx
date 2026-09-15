import { useEffect, useState } from 'react'
import { ArrowLeft, Camera, Minus, Plus } from 'lucide-react'
import { guardarObservacion, guardarFoto, idObservacion, obtenerFoto } from '../../lib/bitacoraVisitante.js'
import { comprimirFoto } from '../../lib/foto.js'
import { campo } from '../../i18n/textos.js'
import { colorPorCategoria } from '../../lib/colorPorCategoria.js'
import { urlPublica } from '../../lib/supabase.js'
import { cn } from '../../lib/utils.js'

// Pantalla de un solo indicador: sí/no (o solo foto), cuántos o qué tan
// marcado (según el tipo de medición — RF-04) y foto opcional u obligatoria.
// Trabaja sobre una copia local y solo escribe en Dexie al tocar "Guardar"
// — así, si se arrepiente y toca "Volver", no queda nada a medio guardar.
// Misma lógica de siempre — esto es solo el diseño (Tailwind).
//
// El padre monta este componente con key={indicador.id}, así que cada vez
// que se abre un indicador distinto React lo crea de nuevo en vez de
// reciclar el anterior — por eso el estado inicial puede leerse directo de
// `observacion` sin un useEffect que lo "resetee" a mano.
export default function Indicador({ indicador, observacion, estacionId, bitacoraId, idioma, textos, onVolver }) {
  const esFoto = indicador.tipoMedicion === 'foto'
  const [visto, setVisto] = useState(observacion?.visto ?? null)
  const [cantidad, setCantidad] = useState(observacion?.cantidad || 1)
  const [escala, setEscala] = useState(observacion?.escala || 3)
  const [foto, setFoto] = useState(null)
  const [comprimiendo, setComprimiendo] = useState(false)

  useEffect(() => {
    if (!observacion?.tieneFoto) return
    obtenerFoto(idObservacion(bitacoraId, estacionId, indicador.id)).then((f) => setFoto(f?.dataUrl ?? null))
  }, [bitacoraId, estacionId, indicador.id, observacion?.tieneFoto])

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

  async function guardar(vistoForzado) {
    const vistoFinal = vistoForzado ?? visto
    if (!esFoto && vistoFinal === null) return
    const obsId = await guardarObservacion(bitacoraId, estacionId, indicador, { visto: vistoFinal, cantidad, escala })
    if (vistoFinal && foto) await guardarFoto(obsId, foto)
    onVolver()
  }

  const nombre = campo(indicador, 'nombre', idioma)
  const pista = campo(indicador, 'pista', idioma)
  const explicacion = campo(indicador, 'explicacion', idioma)

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5">
      <button type="button" onClick={onVolver} className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-ink">
        <ArrowLeft className="size-3.5" /> {textos.volverALista}
      </button>

      <div
        className="entra flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl text-6xl"
        style={{ '--acento-local': colorPorCategoria(indicador.categoria) }}
      >
        {indicador.fotoPath ? (
          <img src={urlPublica('catalogo', indicador.fotoPath)} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_30%_25%,var(--surface),var(--acento-local,var(--leaf-soft)))]">{indicador.emoji}</div>
        )}
      </div>

      <div>
        <h1 className="font-display text-2xl text-ink sm:text-3xl">{nombre}</h1>
        {indicador.nombreCientifico && <p className="mt-0.5 italic text-muted-foreground">{indicador.nombreCientifico}</p>}
      </div>

      {pista && !explicacion && <p className="text-ink-soft">{pista}</p>}
      {explicacion && <p className="rounded-r-xl border-l-[3px] border-pollen bg-pollen-soft px-4 py-2.5 text-ink">{explicacion}</p>}

      {!esFoto && (
        <div>
          <p className="mb-2 font-display font-bold text-ink">{textos.loViste}</p>
          <div className="grid grid-cols-2 gap-2">
            {[{ v: true, t: textos.siLoVi }, { v: false, t: textos.noLoVi }].map((op) => (
              <button
                key={String(op.v)} type="button" aria-pressed={visto === op.v} onClick={() => setVisto(op.v)}
                className={cn(
                  'rounded-xl border-[1.5px] py-3.5 font-display font-bold transition-colors duration-150',
                  visto === op.v ? 'border-leaf bg-leaf-soft text-leaf-deep' : 'border-line bg-surface text-ink-soft',
                )}
              >
                {op.t}
              </button>
            ))}
          </div>
        </div>
      )}

      {indicador.tipoMedicion === 'conteo' && visto === true && (
        <div>
          <p className="mb-2 font-display font-bold text-ink">{textos.cuantosViste}</p>
          <div className="flex items-center justify-center gap-5 rounded-xl border border-line bg-surface py-3">
            <button
              type="button" aria-label="menos" onClick={() => setCantidad((n) => Math.max(1, n - 1))}
              className="grid size-11 place-items-center rounded-full border border-line text-ink transition-transform active:scale-90"
            >
              <Minus className="size-4" />
            </button>
            <output className="min-w-10 text-center font-display text-2xl font-bold tabular-nums text-ink">{cantidad}</output>
            <button
              type="button" aria-label="más" onClick={() => setCantidad((n) => Math.min(999, n + 1))}
              className="grid size-11 place-items-center rounded-full border border-line text-ink transition-transform active:scale-90"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      )}

      {indicador.tipoMedicion === 'escala' && visto === true && (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v} type="button" aria-pressed={escala === v} onClick={() => setEscala(v)}
              className={cn(
                'flex-1 aspect-square rounded-xl border-[1.5px] font-display text-lg font-bold transition-colors duration-150',
                escala === v ? 'border-leaf bg-leaf-soft text-leaf-deep' : 'border-line bg-surface text-ink-soft',
              )}
            >
              {v}
            </button>
          ))}
        </div>
      )}

      {(esFoto || (indicador.pideFoto && visto === true)) && (
        <div>
          <p className="mb-2 font-display font-bold text-ink">{esFoto ? textos.fotoObligatoria : textos.fotoEvidencia}</p>
          {foto && <img src={foto} alt="" className="entra mb-2 w-full rounded-2xl border border-line" />}
          <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 font-medium text-ink-soft transition-colors hover:border-leaf/40">
            <Camera className="size-4" />
            {comprimiendo ? textos.comprimiendo : foto ? textos.cambiarFoto : textos.tomarFoto}
            <input type="file" accept="image/*" capture="environment" onChange={elegirFoto} disabled={comprimiendo} className="hidden" />
          </label>
        </div>
      )}

      <div className="flex flex-col gap-3 pb-2">
        {esFoto ? (
          <>
            <button
              type="button" disabled={!foto} onClick={() => guardar(true)}
              className="w-full rounded-xl bg-leaf px-5 py-3.5 font-display font-semibold text-primary-foreground shadow-[var(--shadow-leaf)] transition-[background-color,transform] duration-150 ease-out hover:bg-leaf-deep active:scale-[0.98] disabled:opacity-40 motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              {textos.guardar}
            </button>
            <button type="button" onClick={() => guardar(false)} className="w-full rounded-xl border border-line bg-surface px-5 py-3 text-sm font-medium text-ink-soft">
              {textos.saltar}
            </button>
          </>
        ) : (
          <button
            type="button" disabled={visto === null} onClick={() => guardar()}
            className="w-full rounded-xl bg-leaf px-5 py-3.5 font-display font-semibold text-primary-foreground shadow-[var(--shadow-leaf)] transition-[background-color,transform] duration-150 ease-out hover:bg-leaf-deep active:scale-[0.98] disabled:opacity-40 motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            {textos.guardar}
          </button>
        )}
      </div>
    </div>
  )
}
