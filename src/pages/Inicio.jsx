import { Link } from 'react-router-dom'
import { supabaseListo } from '../lib/supabase.js'

// Lista de entradas de la app. Cambiar este arreglo cambia las tarjetas de abajo.
const entradas = [
  { a: '/visitante', titulo: 'Visitante', texto: 'Registra lo que ves durante el recorrido.', paso: 'Paso 5' },
  { a: '/guia', titulo: 'Guía', texto: 'Inicia el recorrido y valida las observaciones del grupo.', paso: 'Paso 6' },
  { a: '/admin', titulo: 'Panel de la finca', texto: 'Catálogo, rutas, QR y resultados en el tiempo.', paso: 'Paso 7' },
]

export default function Inicio() {
  return (
    <>
      <p className="eyebrow">Versión en construcción</p>
      <h1>Bitácora Regenerativa</h1>
      <p>Tres entradas, una sola base de datos. Cada una se construye en su paso.</p>
      <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
        {entradas.map((e) => (
          <Link key={e.a} to={e.a} className="card" style={{ textDecoration: 'none' }}>
            <span className="pill warn">{e.paso}</span>
            <h2 style={{ marginTop: 8 }}>{e.titulo}</h2>
            <p style={{ margin: 0 }}>{e.texto}</p>
          </Link>
        ))}
      </div>
      <p className="muted" style={{ marginTop: 20 }}>
        Nube: {supabaseListo ? 'conectada a Supabase' : 'sin configurar todavía (paso 2)'} ·{' '}
        <a href={import.meta.env.BASE_URL + 'demo/'}>ver el demo</a>
      </p>
    </>
  )
}
