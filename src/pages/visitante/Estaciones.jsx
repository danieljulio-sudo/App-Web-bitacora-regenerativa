import { campo } from '../../i18n/textos.js'

// Lista de estaciones de la ruta (RF-03), cada una con su progreso. Es
// "tonta" a propósito: solo lee `observaciones` (que ya llegó reactivamente
// desde Dexie vía useLiveQuery en el padre) y pinta una tarjeta por estación.
export default function Estaciones({ bitacora, estaciones, observaciones, idioma, textos, onAbrir, onTerminar }) {
  const totalIndicadores = estaciones.reduce((n, e) => n + e.indicadores.length, 0)
  const totalRespondidos = observaciones.length
  const porcentaje = totalIndicadores ? Math.round((totalRespondidos / totalIndicadores) * 100) : 0

  return (
    <>
      <p className="eyebrow">{textos.tuBitacora}</p>
      <h2>{bitacora.nombreVisitante ? `${textos.tuBitacora}, ${bitacora.nombreVisitante}` : textos.tuBitacora}</h2>

      <div className="progress">
        <div className="bar"><i style={{ width: `${porcentaje}%` }} /></div>
        <span>{totalRespondidos} / {totalIndicadores}</span>
      </div>

      <div className="tarjetas">
        {estaciones.map((estacion) => {
          const respondidosEstacion = observaciones.filter((o) => o.estacionId === estacion.id).length
          return (
            <button key={estacion.id} className="tarjeta estacion" type="button" onClick={() => onAbrir(estacion.id)}>
              <div className="tarjeta-img" aria-hidden="true">📍</div>
              <div className="tarjeta-body">
                <div className="tarjeta-nombre">{campo(estacion, 'nombre', idioma)}</div>
                <div className="tarjeta-pista">{campo(estacion, 'descripcion', idioma)}</div>
                <div className="estado">
                  <span className={respondidosEstacion === estacion.indicadores.length ? 'pill' : 'pill warn'}>
                    {respondidosEstacion} / {estacion.indicadores.length}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="stack">
        <button className="btn" type="button" onClick={onTerminar}>{textos.terminarRecorrido}</button>
      </div>
    </>
  )
}
