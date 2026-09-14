import { useEffect, useState } from 'react'
import { listarPerfiles, listarInvitaciones, invitar, cambiarRol, cambiarActivo } from '../../lib/admin.js'

// RF-20: quién entra como guía y quién como administrador. Invitar solo dice
// "quién puede entrar y con qué rol" — la cuenta la crea la propia persona
// registrándose con ese correo en /guia o /admin (ver trigger
// `manejar_nuevo_usuario` en supabase/schema.sql). Todavía no hay correo
// automático: hay que avisarle por fuera.
export default function Usuarios() {
  const [perfiles, setPerfiles] = useState(null)
  const [invitaciones, setInvitaciones] = useState(null)
  const [correo, setCorreo] = useState('')
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState('guia')
  const [enviando, setEnviando] = useState(false)

  async function recargar() {
    setPerfiles(await listarPerfiles())
    setInvitaciones(await listarInvitaciones())
  }
  useEffect(() => { recargar() }, [])

  async function enviarInvitacion(e) {
    e.preventDefault()
    setEnviando(true)
    try {
      await invitar({ correo, rol, nombre })
      setCorreo('')
      setNombre('')
      await recargar()
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <h2>Invitar a alguien del equipo</h2>
      <form onSubmit={enviarInvitacion}>
        <label htmlFor="ucorreo">Correo</label>
        <input id="ucorreo" type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} />
        <label htmlFor="unombre">Nombre</label>
        <input id="unombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <label htmlFor="urol">Rol</label>
        <select id="urol" value={rol} onChange={(e) => setRol(e.target.value)}>
          <option value="guia">Guía</option>
          <option value="admin">Administrador</option>
        </select>
        <div className="stack">
          <button className="btn" type="submit" disabled={enviando}>{enviando ? 'Guardando…' : 'Invitar'}</button>
        </div>
      </form>
      <p className="muted">Después de invitar, avísale por fuera (WhatsApp, correo) que entre a /guia o /admin y cree su cuenta con ese mismo correo.</p>

      {invitaciones?.length > 0 && (
        <>
          <h2 style={{ marginTop: 24 }}>Invitados, esperando que creen su cuenta</h2>
          <div className="tabla-envoltura">
            <table className="tabla">
              <thead><tr><th>Correo</th><th>Nombre</th><th>Rol</th></tr></thead>
              <tbody>
                {invitaciones.map((i) => (
                  <tr key={i.correo}><td>{i.correo}</td><td>{i.nombre || '—'}</td><td>{i.rol}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2 style={{ marginTop: 24 }}>Equipo</h2>
      <div className="tabla-envoltura">
        <table className="tabla">
          <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {perfiles?.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.correo}</td>
                <td>
                  <select value={p.rol} onChange={(e) => cambiarRol(p.id, e.target.value).then(recargar)} style={{ padding: '4px 8px' }}>
                    <option value="guia">guía</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td><span className={p.activo ? 'pill' : 'pill off'}>{p.activo ? 'activo' : 'inactivo'}</span></td>
                <td>
                  <button className="pill off" type="button" onClick={() => cambiarActivo(p.id, !p.activo).then(recargar)}>
                    {p.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
