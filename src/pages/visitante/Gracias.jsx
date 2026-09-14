import { Link } from 'react-router-dom'

// Pantalla final (RF-07). `resumen` ya viene calculado desde Visitante.jsx
// porque, para cuando llegamos aquí, la bitácora ya se cerró (pasó a
// "pendiente") y sus observaciones podrían dejar de estar disponibles de
// inmediato.
export default function Gracias({ resumen, textos, onNueva }) {
  return (
    <>
      <p className="eyebrow">{textos.graciasEyebrow}</p>
      <h2>{textos.gracias(resumen.nombreVisitante)}</h2>
      <div className="big">{resumen.vistos} / {resumen.total}</div>
      <p>{textos.resumenTexto(resumen.vistos, resumen.total)}</p>
      <div className="stack">
        <button className="btn soft" type="button" onClick={onNueva}>{textos.nuevaBitacora}</button>
        <Link to="/" className="btn ghost">{textos.volverInicio}</Link>
      </div>
    </>
  )
}
