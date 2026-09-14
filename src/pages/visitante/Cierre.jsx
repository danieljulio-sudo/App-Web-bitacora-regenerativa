import { useState } from 'react'
import { campo } from '../../i18n/textos.js'

// Preguntas de cierre (RF-06), definidas por la finca desde el panel — nada
// fijo en el código. "Enviar" aquí solo significa "pasar de borrador a
// pendiente" en la base local; subirla a Supabase es trabajo del
// sincronizador, no de esta pantalla.
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
    <>
      <button className="back" type="button" onClick={onVolver}>{textos.volverALista}</button>
      <p className="eyebrow">{textos.casiListo}</p>
      <h2>{textos.antesDeIrte}</h2>
      <p>{textos.dosPreguntas}</p>

      {preguntas.map((p) => (
        <div key={p.id}>
          <div className="q">{campo(p, 'texto', idioma)}</div>
          {p.tipo === 'escala' ? (
            <>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button key={v} type="button" aria-pressed={valores[p.id] === v} onClick={() => setValor(p.id, v)}>{v}</button>
                ))}
              </div>
              <div className="scale-hint">
                <span>{campo(p, 'minimo', idioma)}</span>
                <span>{campo(p, 'maximo', idioma)}</span>
              </div>
            </>
          ) : (
            <textarea placeholder={textos.opcional} value={valores[p.id] || ''} onChange={(e) => setValor(p.id, e.target.value)} />
          )}
        </div>
      ))}

      <div className="stack">
        <button className="btn" type="button" disabled={enviando} onClick={enviar}>
          {enviando ? textos.enviando : textos.enviarBitacora}
        </button>
      </div>
    </>
  )
}
