import { createContext, useContext, useMemo, useState } from 'react'
import { t } from './textos.js'

const IdiomaContext = createContext(null)

const CLAVE = 'bitacora-idioma'

function idiomaInicial() {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado === 'es' || guardado === 'en') return guardado
  } catch {
    // localStorage puede fallar (modo privado); seguimos con el navegador.
  }
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'es'
}

// Envuelve la app del visitante (ver Visitante.jsx). Guarda la elección en
// localStorage para que, si el visitante cierra y vuelve a abrir a mitad de
// recorrido, siga en el mismo idioma.
export function IdiomaProvider({ children }) {
  const [idioma, setIdiomaState] = useState(idiomaInicial)

  function setIdioma(valor) {
    setIdiomaState(valor)
    try {
      localStorage.setItem(CLAVE, valor)
    } catch {
      // sin persistencia no pasa nada grave, solo no recuerda la próxima vez.
    }
  }

  const valor = useMemo(() => ({ idioma, setIdioma, textos: t(idioma) }), [idioma])
  return <IdiomaContext.Provider value={valor}>{children}</IdiomaContext.Provider>
}

export function useIdioma() {
  const ctx = useContext(IdiomaContext)
  if (!ctx) throw new Error('useIdioma() se usa dentro de <IdiomaProvider>')
  return ctx
}
