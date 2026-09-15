import { Outlet } from 'react-router-dom'
import { useSesion } from '../lib/sesion.jsx'
import IniciarSesion from './IniciarSesion.jsx'

// Envuelve las rutas de /guia y /admin (ver App.jsx). `rol="admin"` exige
// que el perfil sea admin; sin esa prop, admin o guía sirven — el admin
// puede entrar a la app del guía, pero un guía no entra al panel.
export default function RequiereSesion({ rol }) {
  const { cargando, usuario, perfil } = useSesion()

  if (cargando) return <p className="muted">Cargando…</p>
  if (!usuario) return <IniciarSesion />

  if (!perfil || !perfil.activo) {
    return (
      <>
        <p className="eyebrow">Cuenta sin activar</p>
        <h2>Todavía no tienes acceso</h2>
        <p>
          Tu cuenta se creó pero nadie te ha invitado como guía o administrador. Pídele al
          administrador de la finca que te invite desde el panel con este correo:{' '}
          <b>{usuario.email}</b>.
        </p>
      </>
    )
  }

  const permitido = rol === 'admin' ? perfil.rol === 'admin' : perfil.rol === 'admin' || perfil.rol === 'guia'
  if (!permitido) {
    return (
      <>
        <p className="eyebrow">Sin permiso</p>
        <h2>Esta sección es solo para administradores</h2>
      </>
    )
  }

  return <Outlet />
}
