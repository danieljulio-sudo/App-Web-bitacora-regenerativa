import { Link, Outlet } from 'react-router-dom'
import EstadoConexion from './EstadoConexion.jsx'
import './Layout.css'

// Marco común: cabecera con la marca y el estado de conexión; <Outlet /> es el hueco
// donde React pinta la pantalla que corresponda a la dirección actual.
export default function Layout() {
  return (
    <div className="app">
      <header className="top">
        <Link to="/" className="brand"><i /> Bitácora Regenerativa</Link>
        <EstadoConexion />
      </header>
      <main className="screen">
        <Outlet />
      </main>
    </div>
  )
}
