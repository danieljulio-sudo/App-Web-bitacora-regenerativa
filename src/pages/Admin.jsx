import { Link } from 'react-router-dom'

export default function Admin() {
  return (
    <>
      <p className="eyebrow">Paso 7</p>
      <h1>Panel de la finca</h1>
      <p>Aquí la finca administra el catálogo, las rutas y estaciones, genera QR y ve resultados.</p>
      <Link to="/" className="btn ghost" style={{ marginTop: 'auto' }}>Volver al inicio</Link>
    </>
  )
}
