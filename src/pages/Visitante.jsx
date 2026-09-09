import { Link } from 'react-router-dom'

export default function Visitante() {
  return (
    <>
      <p className="eyebrow">Paso 5</p>
      <h1>Visitante</h1>
      <p>Aquí va la bitácora del visitante: indicadores desde la base de datos, guardado sin señal y sincronización automática.</p>
      <Link to="/" className="btn ghost" style={{ marginTop: 'auto' }}>Volver al inicio</Link>
    </>
  )
}
