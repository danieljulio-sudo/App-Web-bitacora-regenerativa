import { Link } from 'react-router-dom'
import { supabaseListo } from '../lib/supabase.js'
import './Inicio.css'

export default function Inicio() {
  return (
    <>
      <p className="eyebrow inicio-hero">Bitácora Regenerativa</p>
      <h1>Mide el impacto regenerativo de tus recorridos</h1>
      <p>El visitante registra lo que ve durante el recorrido, el guía valida y la finca ve los resultados en el tiempo.</p>

      <div className="menu">
        <Link to="/r/ruta-cacao" className="card tarjeta-menu">
          <div className="tarjeta-menu-icono" style={{ '--acento-local': 'var(--leaf-soft)' }} aria-hidden="true">🥾</div>
          <div className="tarjeta-menu-cuerpo">
            <span className="pill">Visitante</span>
            <h2>Escanea el QR de tu ruta</h2>
            <p>Cada ruta tiene su propio código, al inicio del recorrido. No necesita instalar nada — toca esta tarjeta para probar con la ruta de ejemplo.</p>
          </div>
          <span className="tarjeta-menu-flecha" aria-hidden="true">→</span>
        </Link>

        <Link to="/guia" className="card tarjeta-menu">
          <div className="tarjeta-menu-icono" style={{ '--acento-local': 'var(--pollen-soft)' }} aria-hidden="true">🧭</div>
          <div className="tarjeta-menu-cuerpo">
            <span className="pill warn">Guía</span>
            <h2>Guía</h2>
            <p>Inicia el recorrido, valida las observaciones del grupo y registra las tuyas.</p>
          </div>
          <span className="tarjeta-menu-flecha" aria-hidden="true">→</span>
        </Link>

        <Link to="/admin" className="card tarjeta-menu">
          <div className="tarjeta-menu-icono" style={{ '--acento-local': 'var(--cacao-soft)' }} aria-hidden="true">🌾</div>
          <div className="tarjeta-menu-cuerpo">
            <span className="pill off">Finca</span>
            <h2>Panel de la finca</h2>
            <p>Catálogo, rutas, QR, recorridos y usuarios.</p>
          </div>
          <span className="tarjeta-menu-flecha" aria-hidden="true">→</span>
        </Link>
      </div>

      <div className={`estado-nube ${supabaseListo ? 'ok' : 'mal'}`}>
        <i />
        {supabaseListo ? 'Conectado a Supabase' : 'Falta conectar Supabase (.env)'}
      </div>
    </>
  )
}
