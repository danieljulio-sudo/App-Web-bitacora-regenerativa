import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSesion } from '../../lib/sesion.jsx'
import { listarRutasActivas } from '../../lib/ruta.js'
import { iniciarRecorrido, misRecorridos } from '../../lib/recorridoGuia.js'

// RF-09: iniciar un recorrido indicando ruta, fecha y tamaño del grupo. La
// fecha la pone Supabase sola (columna con default "current_date").
export default function Panel() {
  const { usuario, perfil, salir } = useSesion()
  const navegar = useNavigate()

  const [rutas, setRutas] = useState([])
  const [recorridos, setRecorridos] = useState(null)
  const [rutaId, setRutaId] = useState('')
  const [tamanoGrupo, setTamanoGrupo] = useState('')
  const [notas, setNotas] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    listarRutasActivas().then((r) => {
      setRutas(r)
      if (r.length && !rutaId) setRutaId(r[0].id)
    }).catch((e) => setError(e.message))
    misRecorridos(usuario.id).then(setRecorridos).catch((e) => setError(e.message))
  }, [usuario.id])

  async function iniciar(e) {
    e.preventDefault()
    if (!rutaId) return
    setCargando(true)
    setError('')
    try {
      const recorrido = await iniciarRecorrido({ rutaId, tamanoGrupo: tamanoGrupo ? Number(tamanoGrupo) : null, notas }, usuario.id)
      navegar(`/guia/recorrido/${recorrido.id}`)
    } catch (err) {
      setError(navigator.onLine ? err.message : 'Necesitas señal para iniciar un recorrido nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <p className="eyebrow">Guía · {perfil?.nombre || usuario.email}</p>
      <h1>Tus recorridos</h1>

      <form onSubmit={iniciar}>
        <label htmlFor="ruta">Ruta</label>
        <select id="ruta" value={rutaId} onChange={(e) => setRutaId(e.target.value)}>
          {rutas.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
        </select>
        <label htmlFor="grupo">Tamaño del grupo</label>
        <input id="grupo" type="number" min="1" placeholder="Ej. 8" value={tamanoGrupo} onChange={(e) => setTamanoGrupo(e.target.value)} />
        <label htmlFor="notas">Notas (opcional)</label>
        <input id="notas" type="text" value={notas} onChange={(e) => setNotas(e.target.value)} />
        {error && <p className="muted" style={{ color: 'var(--cacao)' }}>{error}</p>}
        <div className="stack">
          <button className="btn" type="submit" disabled={cargando || !rutaId}>
            {cargando ? 'Iniciando…' : 'Iniciar recorrido nuevo'}
          </button>
        </div>
      </form>

      <h2 style={{ marginTop: 28 }}>Recorridos recientes</h2>
      {recorridos === null && <p className="muted">Cargando…</p>}
      {recorridos?.length === 0 && <p className="muted">Todavía no has iniciado ningún recorrido.</p>}
      <div className="tarjetas">
        {recorridos?.map((r) => (
          <Link key={r.id} className="card" to={`/guia/recorrido/${r.id}`}>
            <span className={r.estado === 'validado' ? 'pill' : r.estado === 'cerrado' ? 'pill warn' : 'pill off'}>{r.estado}</span>
            <p className="muted" style={{ margin: '8px 0 0' }}>{new Date(r.iniciadoEn).toLocaleString('es-CO')}</p>
          </Link>
        ))}
      </div>

      <button className="btn ghost" type="button" style={{ marginTop: 20 }} onClick={salir}>Cerrar sesión</button>
    </>
  )
}
