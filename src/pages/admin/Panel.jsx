import { NavLink, Outlet } from 'react-router-dom'
import { useSesion } from '../../lib/sesion.jsx'

const PESTANAS = [
  { a: 'indicadores', t: 'Indicadores' },
  { a: 'rutas', t: 'Rutas' },
  { a: 'preguntas', t: 'Preguntas' },
  { a: 'recorridos', t: 'Recorridos' },
  { a: 'usuarios', t: 'Usuarios' },
]

// Marco del panel de la finca: pestañas + el hueco donde cada sección pinta
// lo suyo (ver App.jsx para las rutas hijas).
export default function Panel() {
  const { perfil, salir } = useSesion()
  return (
    <>
      <p className="eyebrow">Panel de la finca · {perfil?.nombre}</p>
      <nav className="pestanas">
        {PESTANAS.map((p) => (
          <NavLink key={p.a} to={p.a} className={({ isActive }) => (isActive ? 'activa' : '')}>{p.t}</NavLink>
        ))}
      </nav>
      <Outlet />
      <button className="btn ghost" type="button" style={{ marginTop: 28 }} onClick={salir}>Cerrar sesión</button>
    </>
  )
}
