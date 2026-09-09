import { Link } from 'react-router-dom'

export default function Guia() {
  return (
    <>
      <p className="eyebrow">Paso 6</p>
      <h1>Guía</h1>
      <p>Aquí el guía inicia el recorrido, ve lo que marca el grupo y valida al cierre.</p>
      <Link to="/" className="btn ghost" style={{ marginTop: 'auto' }}>Volver al inicio</Link>
    </>
  )
}
