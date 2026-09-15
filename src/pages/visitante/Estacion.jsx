import { campo } from '../../i18n/textos.js'
import { colorPorCategoria } from '../../lib/colorPorCategoria.js'

// Indicadores de una sola estación (RF-03/RF-04). Misma idea que
// Estaciones.jsx pero un nivel más adentro.
export default function Estacion({ estacion, observaciones, idioma, textos, onAbrir, onVolver }) {
  return (
    <>
      <button className="back" type="button" onClick={onVolver}>{textos.volverALista}</button>
      <p className="eyebrow">{campo(estacion, 'nombre', idioma)}</p>
      <h2>{campo(estacion, 'descripcion', idioma) || campo(estacion, 'nombre', idioma)}</h2>

      <div className="tarjetas">
        {estacion.indicadores.map((i) => {
          const o = observaciones.find((x) => x.indicadorId === i.id)
          return (
            <button key={i.id} className="tarjeta" type="button" onClick={() => onAbrir(i.id)}>
              <div className="tarjeta-img" style={{ '--acento-local': colorPorCategoria(i.categoria) }} aria-hidden="true">{i.emoji}</div>
              {o?.tieneFoto && <span className="photo-dot">📷</span>}
              <div className="tarjeta-body">
                <div className="tarjeta-nombre">{campo(i, 'nombre', idioma)}</div>
                <div className="tarjeta-pista">{campo(i, 'pista', idioma)}</div>
                {!o && <div className="estado pendiente">{textos.tocaParaRegistrar}</div>}
                {o && o.visto && (
                  <div className="estado">
                    <span className="pill">
                      {i.tipoMedicion === 'conteo' && textos.vistos(o.cantidad)}
                      {i.tipoMedicion === 'escala' && `${o.escala} / 5`}
                      {(i.tipoMedicion === 'si_no' || i.tipoMedicion === 'foto') && textos.visto}
                    </span>
                  </div>
                )}
                {o && !o.visto && (
                  <div className="estado">
                    <span className="pill off">{textos.noVisto}</span>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}
