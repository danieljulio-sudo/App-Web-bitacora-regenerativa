import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { campo } from '../../i18n/textos.js'
import { cn } from '../../lib/utils.js'

// Preguntas de cierre (RF-06), definidas por la finca desde el panel — nada
// fijo en el código. "Enviar" aquí solo significa "pasar de borrador a
// pendiente" en la base local; subirla a Supabase es trabajo del
// sincronizador, no de esta pantalla. Misma lógica de siempre — esto es
// solo el diseño (Tailwind).
export default function Cierre({ preguntas, idioma, textos, onVolver, onEnviar }) {
  const [valores, setValores] = useState({})
  const [enviando, setEnviando] = useState(false)

  function setValor(preguntaId, valor) {
    setValores((v) => ({ ...v, [preguntaId]: valor }))
  }

  async function enviar() {
    setEnviando(true)
    try {
      await onEnviar(valores)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5">
      <button type="button" onClick={onVolver} className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-ink">
        <ArrowLeft className="size-3.5" /> {textos.volverALista}
      </button>

      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{textos.casiListo}</p>
        <h1 className="mt-1 font-display text-2xl text-ink sm:text-3xl">{textos.antesDeIrte}</h1>
        <p className="mt-2 text-ink-soft">{textos.dosPreguntas}</p>
      </div>

      <div className="flex flex-col gap-5">
        {preguntas.map((p) => (
          <div key={p.id}>
            <p className="mb-2 font-display font-bold text-ink">{campo(p, 'texto', idioma)}</p>
            {p.tipo === 'escala' ? (
              <>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v} type="button" aria-pressed={valores[p.id] === v} onClick={() => setValor(p.id, v)}
                      className={cn(
                        'flex-1 aspect-square rounded-xl border-[1.5px] font-display text-lg font-bold transition-colors duration-150',
                        valores[p.id] === v ? 'border-leaf bg-leaf-soft text-leaf-deep' : 'border-line bg-surface text-ink-soft',
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                  <span>{campo(p, 'minimo', idioma)}</span>
                  <span>{campo(p, 'maximo', idioma)}</span>
                </div>
              </>
            ) : (
              <textarea
                placeholder={textos.opcional} value={valores[p.id] || ''} onChange={(e) => setValor(p.id, e.target.value)}
                className="min-h-[84px] w-full resize-y rounded-xl border border-line bg-surface px-4 py-3 text-ink outline-none transition-colors focus:border-leaf focus:ring-2 focus:ring-leaf/20"
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="button" disabled={enviando} onClick={enviar}
        className="w-full rounded-xl bg-leaf px-5 py-3.5 font-display font-semibold text-primary-foreground shadow-[var(--shadow-leaf)] transition-[background-color,transform] duration-150 ease-out hover:bg-leaf-deep active:scale-[0.98] disabled:opacity-40 motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        {enviando ? textos.enviando : textos.enviarBitacora}
      </button>
    </div>
  )
}
