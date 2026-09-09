import { useState } from 'react'

// Dos preguntas de cierre (qué tanto aprendió, qué le llamó la atención) y
// el botón que envía la bitácora. "Enviar" en este paso solo significa
// "pasar de borrador a pendiente" en la base local — subirla a Supabase es
// trabajo de otra pieza (el sincronizador), no de esta pantalla.
export default function Cierre({ bitacora, onVolver, onEnviar }) {
  const [aprendizaje, setAprendizaje] = useState(bitacora.aprendizaje ?? null)
  const [comentario, setComentario] = useState(bitacora.comentario ?? '')
  const [enviando, setEnviando] = useState(false)

  async function enviar() {
    setEnviando(true)
    try {
      await onEnviar({ aprendizaje, comentario })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <button className="back" type="button" onClick={onVolver}>← Volver a la lista</button>
      <p className="eyebrow">Casi listo</p>
      <h2>Antes de irte</h2>
      <p>Dos preguntas cortas. Esto le sirve a la finca tanto como lo que viste.</p>

      <div className="q">¿Qué tanto aprendiste hoy sobre el suelo y el bosque?</div>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((v) => (
          <button key={v} type="button" aria-pressed={aprendizaje === v} onClick={() => setAprendizaje(v)}>
            {v}
          </button>
        ))}
      </div>
      <div className="scale-hint">
        <span>Nada nuevo</span>
        <span>Muchísimo</span>
      </div>

      <label htmlFor="comentario">¿Qué fue lo que más te llamó la atención?</label>
      <textarea
        id="comentario"
        placeholder="Opcional"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
      />

      <div className="stack">
        <button className="btn" type="button" disabled={enviando} onClick={enviar}>
          {enviando ? 'Enviando…' : 'Enviar bitácora'}
        </button>
      </div>
    </>
  )
}
