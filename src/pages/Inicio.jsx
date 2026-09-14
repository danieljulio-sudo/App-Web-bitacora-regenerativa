import { Link } from 'react-router-dom'
import { supabaseListo } from '../lib/supabase.js'

export default function Inicio() {
  return (
    <>
      <p className="eyebrow">Bitácora Regenerativa</p>
      <h1>Mide el impacto regenerativo de tus recorridos</h1>
      <p>El visitante registra lo que ve durante el recorrido, el guía valida y la finca ve los resultados en el tiempo.</p>

      <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
        <div className="card">
          <span className="pill">Visitante</span>
          <h2 style={{ marginTop: 8 }}>Escanea el QR de tu ruta</h2>
          <p style={{ margin: '0 0 10px' }}>Cada ruta tiene su propio código, ubicado al inicio del recorrido. No necesita instalar nada.</p>
          <Link to="/r/ruta-cacao" className="btn ghost">Probar con la ruta de ejemplo →</Link>
        </div>

        <Link to="/guia" className="card" style={{ textDecoration: 'none' }}>
          <span className="pill warn">Guía</span>
          <h2 style={{ marginTop: 8 }}>Guía</h2>
          <p style={{ margin: 0 }}>Inicia el recorrido, valida las observaciones del grupo y registra las tuyas.</p>
        </Link>

        <Link to="/admin" className="card" style={{ textDecoration: 'none' }}>
          <span className="pill off">Finca</span>
          <h2 style={{ marginTop: 8 }}>Panel de la finca</h2>
          <p style={{ margin: 0 }}>Catálogo, rutas, QR, recorridos y usuarios.</p>
        </Link>
      </div>

      <p className="muted" style={{ marginTop: 20 }}>
        Nube: {supabaseListo ? 'conectada a Supabase' : 'sin configurar — falta el archivo .env'}
      </p>
    </>
  )
}
