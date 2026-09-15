import { NavLink, Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useSesion } from '../../lib/sesion.jsx'
import { cn } from '../../lib/utils.js'

const PESTANAS = [
  { a: 'indicadores', t: 'Indicadores' },
  { a: 'rutas', t: 'Rutas' },
  { a: 'preguntas', t: 'Preguntas' },
  { a: 'recorridos', t: 'Recorridos' },
  { a: 'usuarios', t: 'Usuarios' },
]

// Marco del panel de la finca: pestañas + el hueco donde cada sección pinta
// lo suyo (ver App.jsx para las rutas hijas). No hay prototipo de diseño
// para el panel (ver PLAN-FASE1.md) — este es el mismo sistema visual que
// ya validamos en el visitante y en guía, aplicado a una pantalla de
// escritorio/tablet en vez de celular.
export default function Panel() {
  const { perfil, salir } = useSesion()
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Panel de la finca</p>
          <h1 className="font-display text-2xl text-ink">{perfil?.nombre}</h1>
        </div>
        <button
          onClick={salir} type="button"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-ink"
        >
          <LogOut className="size-3.5" /> Salir
        </button>
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1">
        {PESTANAS.map((p) => (
          <NavLink
            key={p.a} to={p.a}
            className={({ isActive }) => cn(
              'shrink-0 rounded-full border px-4 py-2 font-display text-sm font-semibold transition-colors',
              isActive ? 'border-ink bg-ink text-paper' : 'border-line text-muted-foreground hover:border-leaf/40 hover:text-ink',
            )}
          >
            {p.t}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  )
}
