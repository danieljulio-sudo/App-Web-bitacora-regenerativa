import { useEffect } from 'react'
import { sincronizarPendientes } from '../lib/sincronizar.js'

// No pinta nada — vive montado en el Layout (o sea, en toda la app) solo
// para disparar la subida de bitácoras pendientes: al entrar, cuando el
// celular recupera señal, y cada minuto como respaldo por si el evento
// 'online' no se dispara (pasa a veces en algunos navegadores móviles).
export default function Sincronizador() {
  useEffect(() => {
    sincronizarPendientes()
    window.addEventListener('online', sincronizarPendientes)
    const intervalo = setInterval(sincronizarPendientes, 60_000)
    return () => {
      window.removeEventListener('online', sincronizarPendientes)
      clearInterval(intervalo)
    }
  }, [])

  return null
}
