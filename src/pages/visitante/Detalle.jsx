import { useEffect, useState } from 'react'
import { guardarObservacion, guardarFoto, idObservacion, obtenerFoto } from '../../lib/bitacoraVisitante.js'
import { comprimirFoto } from '../../lib/foto.js'

// Pantalla de una sola señal: sí/no, cuántos (si aplica) y foto opcional.
// Trabaja sobre una copia local (visto/cantidad/foto) y solo escribe en
// Dexie cuando el visitante toca "Guardar" — así, si se arrepiente y toca
// "Volver", no queda nada a medio guardar.
//
// El padre (Visitante.jsx) monta este componente con key={indicador.id}, así
// que cada vez que se abre una señal distinta React lo crea de nuevo en vez
// de reciclar el anterior — por eso el estado inicial puede leerse directo
// de `observacion` sin un useEffect que lo "resetee" a mano.
export default function Detalle({ indicador, observacion, bitacoraId, onVolver }) {
  const [visto, setVisto] = useState(observacion?.visto ?? null)
  const [cantidad, setCantidad] = useState(observacion?.cantidad || 1)
  const [foto, setFoto] = useState(null)
  const [comprimiendo, setComprimiendo] = useState(false)

  // Esta sí es una sincronización legítima con algo externo (la tabla de
  // fotos): solo se dispara una vez, al montar la pantalla de esta señal.
  useEffect(() => {
    if (!observacion?.tieneFoto) return
    obtenerFoto(idObservacion(bitacoraId, indicador.id)).then((f) => setFoto(f?.dataUrl ?? null))
  }, [bitacoraId, indicador.id, observacion?.tieneFoto])

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

  async function guardar() {
    if (visto === null) return
    const obsId = await guardarObservacion(bitacoraId, indicador.id, { visto, cantidad })
    if (visto && foto) await guardarFoto(obsId, foto)
    onVolver()
  }

  return (
    <>
      <button className="back" type="button" onClick={onVolver}>← Volver a la lista</button>

      <div className="hero" aria-hidden="true">{indicador.emoji}</div>
      <h2>{indicador.nombre}</h2>
      {indicador.nombreCientifico && (
        <p className="muted"><i>{indicador.nombreCientifico}</i></p>
      )}
      <p className="why">{indicador.porque}</p>

      <div className="q">¿Lo viste en el recorrido?</div>
      <div className="seg">
        <button type="button" aria-pressed={visto === true} onClick={() => setVisto(true)}>Sí, lo vi</button>
        <button type="button" aria-pressed={visto === false} onClick={() => setVisto(false)}>No lo vi</button>
      </div>

      {indicador.clase === 'conteo' && visto === true && (
        <div>
          <div className="q">¿Cuántos viste, más o menos?</div>
          <div className="counter">
            <button type="button" aria-label="menos" onClick={() => setCantidad((n) => Math.max(1, n - 1))}>−</button>
            <output>{cantidad}</output>
            <button type="button" aria-label="más" onClick={() => setCantidad((n) => Math.min(999, n + 1))}>+</button>
          </div>
        </div>
      )}

      {indicador.pideFoto && visto === true && (
        <div className="photo">
          <div className="q">Foto de evidencia (opcional)</div>
          {foto && <img src={foto} alt="" />}
          <label className="btn ghost">
            {comprimiendo ? 'Comprimiendo…' : foto ? '📷 Cambiar foto' : '📷 Tomar foto'}
            <input
              className="file"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={elegirFoto}
              disabled={comprimiendo}
            />
          </label>
        </div>
      )}

      <div className="stack">
        <button className="btn" type="button" disabled={visto === null} onClick={guardar}>Guardar</button>
      </div>
    </>
  )
}
