import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db.js'

// Muestra si hay internet y cuántas bitácoras esperan subirse.
// useLiveQuery vuelve a preguntar a la base local cada vez que cambia.
export default function EstadoConexion() {
  const [enLinea, setEnLinea] = useState(navigator.onLine)
  const pendientes = useLiveQuery(() => db.bitacoras.where('estado').equals('pendiente').count(), [], 0)

  useEffect(() => {
    const on = () => setEnLinea(true)
    const off = () => setEnLinea(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (!enLinea) return <span className="pill off">Sin señal · {pendientes} por subir</span>
  if (pendientes > 0) return <span className="pill warn">Subiendo {pendientes}…</span>
  return <span className="pill">En línea</span>
}
