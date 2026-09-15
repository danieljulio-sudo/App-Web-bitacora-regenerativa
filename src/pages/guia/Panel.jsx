import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CalendarDays, ChevronRight, LogOut, Plus } from 'lucide-react'
import { useSesion } from '../../lib/sesion.jsx'
import { listarRutasActivas } from '../../lib/ruta.js'
import { iniciarRecorrido, misRecorridos } from '../../lib/recorridoGuia.js'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet.jsx'
import { cn } from '../../lib/utils.js'

const TINTE_ESTADO = {
  abierto: 'bg-pollen-soft text-accent-foreground',
  cerrado: 'bg-sky text-ink-soft',
  validado: 'bg-leaf-soft text-leaf-deep',
}

// RF-09: iniciar un recorrido indicando ruta, fecha y tamaño del grupo. La
// fecha la pone Supabase sola (columna con default "current_date"). Diseño
// traído del prototipo: la creación pasa a una hoja deslizante en vez de un
// formulario fijo en la pantalla.
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
  const [abierto, setAbierto] = useState(false)

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
      setAbierto(false)
      navegar(`/guia/recorrido/${recorrido.id}`)
    } catch (err) {
      setError(navigator.onLine ? err.message : 'Necesitas señal para iniciar un recorrido nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[30rem] flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {perfil?.nombre || usuario.email}
          </p>
          <h1 className="font-display text-2xl text-ink">Mis recorridos</h1>
        </div>
        <button
          onClick={salir} type="button" aria-label="Cerrar sesión"
          className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-surface text-muted-foreground transition-colors hover:text-ink"
        >
          <LogOut className="size-4" />
        </button>
      </div>

      {recorridos === null && <p className="text-muted-foreground">Cargando…</p>}
      {recorridos?.length === 0 && <p className="text-muted-foreground">Todavía no has iniciado ningún recorrido.</p>}
      <div className="flex flex-col gap-3">
        {recorridos?.map((r) => (
          <Link
            key={r.id} to={`/guia/recorrido/${r.id}`}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-line bg-surface p-4 shadow-[0_1px_0_rgba(36,33,28,0.04)] transition-colors hover:border-leaf/40"
          >
            <div className="min-w-0">
              <span className={cn('inline-block rounded-md px-2 py-0.5 text-[0.7rem]', TINTE_ESTADO[r.estado])}>{r.estado}</span>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" /> {new Date(r.iniciadoEn).toLocaleString('es-CO')}
              </p>
            </div>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <Sheet open={abierto} onOpenChange={setAbierto}>
        <SheetTrigger className="flex w-full items-center justify-center gap-2 rounded-xl bg-leaf px-5 py-3.5 font-display font-semibold text-primary-foreground shadow-[var(--shadow-leaf)] transition-colors hover:bg-leaf-deep">
          <Plus className="size-4" /> Iniciar recorrido nuevo
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Nuevo recorrido</SheetTitle>
            <SheetDescription>Elige la ruta y cuántos van en el grupo.</SheetDescription>
          </SheetHeader>
          <form onSubmit={iniciar} className="flex flex-col gap-4">
            <div>
              <label htmlFor="ruta" className="mb-1.5 block text-sm font-medium text-ink">Ruta</label>
              <select
                id="ruta" value={rutaId} onChange={(e) => setRutaId(e.target.value)}
                className="w-full rounded-md border border-line bg-paper px-4 py-3 text-ink outline-none focus:border-leaf"
              >
                {rutas.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="grupo" className="mb-1.5 block text-sm font-medium text-ink">Tamaño del grupo</label>
              <input
                id="grupo" type="number" min="1" placeholder="Ej. 8" value={tamanoGrupo} onChange={(e) => setTamanoGrupo(e.target.value)}
                className="w-full rounded-md border border-line bg-paper px-4 py-3 text-ink outline-none focus:border-leaf"
              />
            </div>
            <div>
              <label htmlFor="notas" className="mb-1.5 block text-sm font-medium text-ink">Notas (opcional)</label>
              <input
                id="notas" type="text" value={notas} onChange={(e) => setNotas(e.target.value)}
                className="w-full rounded-md border border-line bg-paper px-4 py-3 text-ink outline-none focus:border-leaf"
              />
            </div>
            {error && <p className="rounded-md border border-cacao-soft bg-cacao-soft/40 px-3 py-2 text-sm text-cacao">{error}</p>}
            <button
              type="submit" disabled={cargando || !rutaId}
              className="w-full rounded-xl bg-leaf px-5 py-3.5 font-display font-semibold text-primary-foreground disabled:opacity-40"
            >
              {cargando ? 'Iniciando…' : 'Iniciar recorrido'}
            </button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
