// Lista de indicadores con su estado actual. Es "tonta" a propósito: solo
// lee `observaciones` (que ya llegó reactivamente desde Dexie vía
// useLiveQuery en el padre) y pinta una tarjeta por indicador.
export default function Recorrido({ bitacora, indicadores, observaciones, onAbrir, onTerminar }) {
  const respondidos = observaciones.length
  const porcentaje = indicadores.length ? Math.round((respondidos / indicadores.length) * 100) : 0

  return (
    <>
      <p className="eyebrow">Ruta del Cacao</p>
      <h2>Tu bitácora{bitacora.nombreVisitante ? `, ${bitacora.nombreVisitante}` : ''}</h2>

      <div className="progress">
        <div className="bar"><i style={{ width: `${porcentaje}%` }} /></div>
        <span>{respondidos} / {indicadores.length}</span>
      </div>

      <div className="tarjetas">
        {indicadores.map((i) => {
          const o = observaciones.find((x) => x.indicadorId === i.id)
          return (
            <button key={i.id} className="tarjeta" type="button" onClick={() => onAbrir(i.id)}>
              <div className="tarjeta-img" aria-hidden="true">{i.emoji}</div>
              {o?.tieneFoto && <span className="photo-dot">📷 foto</span>}
              <div className="tarjeta-body">
                <div className="tarjeta-nombre">{i.nombre}</div>
                <div className="tarjeta-pista">{i.pista}</div>
                {!o && <div className="estado pendiente">Toca para registrar →</div>}
                {o && o.visto && (
                  <div className="estado">
                    <span className="pill">{i.clase === 'conteo' ? `${o.cantidad} vistos` : 'Visto'}</span>
                  </div>
                )}
                {o && !o.visto && (
                  <div className="estado">
                    <span className="pill off">No visto</span>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="stack">
        <button className="btn" type="button" onClick={onTerminar}>Terminar recorrido</button>
      </div>
    </>
  )
}
