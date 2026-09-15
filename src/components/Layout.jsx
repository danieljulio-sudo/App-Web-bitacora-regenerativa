import { Link, Outlet, useLocation } from 'react-router-dom'
import EstadoConexion from './EstadoConexion.jsx'
import Sincronizador from './Sincronizador.jsx'
import './Layout.css'

// Marco común: cabecera con la marca y el estado de conexión; <Outlet /> es el hueco
// donde React pinta la pantalla que corresponda a la dirección actual.
//
// El panel de la finca (/admin) necesita más ancho que el celular angosto
// del visitante — tablas, formularios de varias columnas — así que ensancha
// el marco solo para esas direcciones, mirando la URL actual.
export default function Layout() {
  const { pathname } = useLocation()
  const ancho = pathname.startsWith('/admin')
  return (
    <div className={ancho ? 'app ancho' : 'app'}>
      <Sincronizador />
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
