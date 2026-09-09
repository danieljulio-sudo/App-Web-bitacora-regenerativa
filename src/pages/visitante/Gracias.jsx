import { Link } from 'react-router-dom'

// Pantalla final. `resumen` ya viene calculado desde Visitante.jsx porque,
// para cuando llegamos aquí, la bitácora ya se cerró (pasó a "pendiente")
// y sus observaciones podrían dejar de estar disponibles de inmediato.
export default function Gracias({ resumen, onNueva }) {
  return (
    <>
      <p className="eyebrow">Bitácora guardada</p>
      <h2>¡Gracias{resumen.nombreVisitante ? `, ${resumen.nombreVisitante}` : ''}!</h2>
      <div className="big">{resumen.vistos} / {resumen.total}</div>
      <p>
        Viste {resumen.vistos} de {resumen.total} señales de regeneración. Tu bitácora ya quedó
        guardada en este celular y se sube sola en cuanto haya señal.
      </p>
      <div className="stack">
        <button className="btn soft" type="button" onClick={onNueva}>Nueva bitácora</button>
        <Link to="/" className="btn ghost">Volver al inicio</Link>
      </div>
    </>
  )
}
