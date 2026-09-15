import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { listarRecorridos } from '../../lib/admin.js'
import { chip } from '../../lib/estilosFormulario.js'
import { cn } from '../../lib/utils.js'

const TINTE = {
  validado: 'bg-leaf-soft text-leaf-deep',
  cerrado: 'bg-pollen-soft text-accent-foreground',
  abierto: 'bg-muted text-muted-foreground',
}

// RF-16: lista de recorridos con su estado. Cada fila abre la misma
// pantalla que usa el guía para validar y exportar — ver
// pages/guia/Recorrido.jsx, que admin también puede usar (RequiereSesion
// deja pasar tanto a "admin" como a "guia" en /guia/*).
export default function Recorridos() {
  const [lista, setLista] = useState(null)
  useEffect(() => { listarRecorridos().then(setLista) }, [])

  return (
    <div>
      <h2 className="font-display text-lg text-ink">Recorridos</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-line">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5">Fecha</th><th className="px-4 py-2.5">Ruta</th><th className="px-4 py-2.5">Grupo</th><th className="px-4 py-2.5">Estado</th><th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {lista?.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0 hover:bg-leaf-soft/40">
                <td className="px-4 py-2.5 text-ink">{new Date(r.iniciado_en).toLocaleString('es-CO')}</td>
                <td className="px-4 py-2.5 text-ink">{r.rutas?.nombre}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{r.tamano_grupo ?? '—'}</td>
                <td className="px-4 py-2.5"><span className={cn(chip, TINTE[r.estado] ?? TINTE.abierto)}>{r.estado}</span></td>
                <td className="px-4 py-2.5">
                  <Link to={`/guia/recorrido/${r.id}`} className={cn(chip, 'bg-leaf-soft text-leaf-deep')}><Eye className="size-3" /> Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista?.length === 0 && <p className="p-4 text-sm text-muted-foreground">Todavía no hay recorridos.</p>}
      </div>
    </div>
  )
}
