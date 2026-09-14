import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarRecorridos } from '../../lib/admin.js'

// RF-16: lista de recorridos con su estado. Cada fila abre la misma
// pantalla que usa el guía para validar y exportar — ver
// pages/guia/Recorrido.jsx, que admin también puede usar (RequiereSesion
// deja pasar tanto a "admin" como a "guia" en /guia/*).
export default function Recorridos() {
  const [lista, setLista] = useState(null)
  useEffect(() => { listarRecorridos().then(setLista) }, [])

  return (
    <>
      <h2>Recorridos</h2>
      <div className="tabla-envoltura">
        <table className="tabla">
          <thead><tr><th>Fecha</th><th>Ruta</th><th>Grupo</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {lista?.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.iniciado_en).toLocaleString('es-CO')}</td>
                <td>{r.rutas?.nombre}</td>
                <td>{r.tamano_grupo ?? '—'}</td>
                <td><span className={r.estado === 'validado' ? 'pill' : r.estado === 'cerrado' ? 'pill warn' : 'pill off'}>{r.estado}</span></td>
                <td><Link className="pill" to={`/guia/recorrido/${r.id}`}>Ver</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista?.length === 0 && <p className="muted" style={{ padding: 14 }}>Todavía no hay recorridos.</p>}
      </div>
    </>
  )
}
