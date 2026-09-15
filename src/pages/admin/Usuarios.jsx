import { useEffect, useState } from 'react'
import { UserPlus } from 'lucide-react'
import { listarPerfiles, listarInvitaciones, invitar, cambiarRol, cambiarActivo } from '../../lib/admin.js'
import { campoInput, campoLabel, tarjeta, botonPrimario, chip } from '../../lib/estilosFormulario.js'
import { cn } from '../../lib/utils.js'

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
    <div className="flex flex-col gap-6">
      <div className={tarjeta}>
        <h2 className="font-display text-lg text-ink">Invitar a alguien del equipo</h2>
        <form onSubmit={enviarInvitacion} className="mt-1 grid gap-x-5 sm:grid-cols-3">
          <div>
            <label htmlFor="ucorreo" className={campoLabel}>Correo</label>
            <input id="ucorreo" type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} className={campoInput} />
          </div>
          <div>
            <label htmlFor="unombre" className={campoLabel}>Nombre</label>
            <input id="unombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className={campoInput} />
          </div>
          <div>
            <label htmlFor="urol" className={campoLabel}>Rol</label>
            <select id="urol" value={rol} onChange={(e) => setRol(e.target.value)} className={campoInput}>
              <option value="guia">Guía</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="mt-4 sm:col-span-3">
            <button type="submit" disabled={enviando} className={cn(botonPrimario, 'inline-flex items-center gap-2')}>
              <UserPlus className="size-4" /> {enviando ? 'Guardando…' : 'Invitar'}
            </button>
          </div>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">Después de invitar, avísale por fuera (WhatsApp, correo) que entre a /guia o /admin y cree su cuenta con ese mismo correo.</p>
      </div>

      {invitaciones?.length > 0 && (
        <div>
          <h2 className="font-display text-lg text-ink">Invitados, esperando que creen su cuenta</h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-line">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5">Correo</th><th className="px-4 py-2.5">Nombre</th><th className="px-4 py-2.5">Rol</th>
                </tr>
              </thead>
              <tbody>
                {invitaciones.map((i) => (
                  <tr key={i.correo} className="border-b border-line last:border-0">
                    <td className="px-4 py-2.5 text-ink">{i.correo}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{i.nombre || '—'}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{i.rol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h2 className="font-display text-lg text-ink">Equipo</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-line">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5">Nombre</th><th className="px-4 py-2.5">Correo</th><th className="px-4 py-2.5">Rol</th><th className="px-4 py-2.5">Estado</th><th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {perfiles?.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0 hover:bg-leaf-soft/40">
                  <td className="px-4 py-2.5 text-ink">{p.nombre}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.correo}</td>
                  <td className="px-4 py-2.5">
                    <select value={p.rol} onChange={(e) => cambiarRol(p.id, e.target.value).then(recargar)} className="rounded-md border border-line bg-surface px-2 py-1 text-sm">
                      <option value="guia">guía</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn(chip, p.activo ? 'bg-leaf-soft text-leaf-deep' : 'bg-muted text-muted-foreground')}>{p.activo ? 'activo' : 'inactivo'}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <button type="button" onClick={() => cambiarActivo(p.id, !p.activo).then(recargar)} className={cn(chip, 'bg-muted text-muted-foreground')}>
                      {p.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
