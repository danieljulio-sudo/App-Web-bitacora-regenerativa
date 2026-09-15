import { useEffect, useState } from 'react'
import { guardarObservacion, guardarFoto, idObservacion, obtenerFoto } from '../../lib/bitacoraVisitante.js'
import { comprimirFoto } from '../../lib/foto.js'
import { campo } from '../../i18n/textos.js'
import { colorPorCategoria } from '../../lib/colorPorCategoria.js'
import { urlPublica } from '../../lib/supabase.js'

// Pantalla de un solo indicador: sí/no (o solo foto), cuántos o qué tan
// marcado (según el tipo de medición — RF-04) y foto opcional u obligatoria.
// Trabaja sobre una copia local y solo escribe en Dexie al tocar "Guardar"
// — así, si se arrepiente y toca "Volver", no queda nada a medio guardar.
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
    <>
      <button className="back" type="button" onClick={onVolver}>{textos.volverALista}</button>

      <div className="hero" style={{ '--acento-local': colorPorCategoria(indicador.categoria) }} aria-hidden="true">
        {indicador.fotoPath ? <img src={urlPublica('catalogo', indicador.fotoPath)} alt="" /> : indicador.emoji}
      </div>
      <h2>{nombre}</h2>
      {indicador.nombreCientifico && <p className="muted"><i>{indicador.nombreCientifico}</i></p>}
      {pista && !explicacion && <p className="muted">{pista}</p>}
      {explicacion && <p className="why">{explicacion}</p>}

      {!esFoto && (
        <>
          <div className="q">{textos.loViste}</div>
          <div className="seg">
            <button type="button" aria-pressed={visto === true} onClick={() => setVisto(true)}>{textos.siLoVi}</button>
            <button type="button" aria-pressed={visto === false} onClick={() => setVisto(false)}>{textos.noLoVi}</button>
          </div>
        </>
      )}

      {indicador.tipoMedicion === 'conteo' && visto === true && (
        <div>
          <div className="q">{textos.cuantosViste}</div>
          <div className="counter">
            <button type="button" aria-label="menos" onClick={() => setCantidad((n) => Math.max(1, n - 1))}>−</button>
            <output>{cantidad}</output>
            <button type="button" aria-label="más" onClick={() => setCantidad((n) => Math.min(999, n + 1))}>+</button>
          </div>
        </div>
      )}

      {indicador.tipoMedicion === 'escala' && visto === true && (
        <div>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((v) => (
              <button key={v} type="button" aria-pressed={escala === v} onClick={() => setEscala(v)}>{v}</button>
            ))}
          </div>
        </div>
      )}

      {(esFoto || (indicador.pideFoto && visto === true)) && (
        <div className="photo">
          <div className="q">{esFoto ? textos.fotoObligatoria : textos.fotoEvidencia}</div>
          {foto && <img src={foto} alt="" />}
          <label className="btn ghost">
            {comprimiendo ? textos.comprimiendo : foto ? textos.cambiarFoto : textos.tomarFoto}
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
        {esFoto ? (
          <>
            <button className="btn" type="button" disabled={!foto} onClick={() => guardar(true)}>{textos.guardar}</button>
            <button className="btn ghost" type="button" onClick={() => guardar(false)}>{textos.saltar}</button>
          </>
        ) : (
          <button className="btn" type="button" disabled={visto === null} onClick={() => guardar()}>{textos.guardar}</button>
        )}
      </div>
    </>
  )
}
