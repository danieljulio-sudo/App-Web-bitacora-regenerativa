import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db.js'
import { listarIndicadores } from '../lib/catalogo.js'
import { obtenerBorrador, crearBorrador, cerrarBitacora, contarVistos } from '../lib/bitacoraVisitante.js'
import './visitante/Visitante.css'
import Bienvenida from './visitante/Bienvenida.jsx'
import Recorrido from './visitante/Recorrido.jsx'
import Detalle from './visitante/Detalle.jsx'
import Cierre from './visitante/Cierre.jsx'
import Gracias from './visitante/Gracias.jsx'

// Esta pantalla es una "máquina de estados": en cada momento estamos en una
// sola de estas etapas, y cada acción del visitante nos mueve a la
// siguiente. `bitacora` vive aquí (en el padre) porque varias pantallas la
// necesitan; los datos que cambian seguido (indicadores, observaciones) se
// leen con useLiveQuery, que vuelve a preguntarle a Dexie solos cuando algo
// cambia — así no hay que refrescar nada a mano.
export default function Visitante() {
  const [etapa, setEtapa] = useState('cargando') // cargando | bienvenida | recorrido | detalle | cierre | gracias
  const [bitacora, setBitacora] = useState(null)
  const [indicadorActualId, setIndicadorActualId] = useState(null)
  const [resumen, setResumen] = useState(null) // solo para la pantalla de "gracias"

  const indicadores = useLiveQuery(listarIndicadores, [], [])
  const observaciones = useLiveQuery(
    () => (bitacora ? db.observaciones.where('bitacoraId').equals(bitacora.id).toArray() : []),
    [bitacora?.id],
    [],
  )

  // Al entrar a /visitante revisamos si ya había una bitácora sin terminar
  // en este celular (por ejemplo, si cerró la app a mitad del recorrido) y
  // la retomamos donde quedó, en vez de empezar de cero.
  useEffect(() => {
    obtenerBorrador().then((borrador) => {
      if (borrador) {
        setBitacora(borrador)
        setEtapa('recorrido')
      } else {
        setEtapa('bienvenida')
      }
    })
  }, [])

  async function iniciar({ nombreVisitante, pais }) {
    const nueva = await crearBorrador({ nombreVisitante, pais })
    setBitacora(nueva)
    setEtapa('recorrido')
  }

  function abrirIndicador(id) {
    setIndicadorActualId(id)
    setEtapa('detalle')
  }

  function volverAlRecorrido() {
    setIndicadorActualId(null)
    setEtapa('recorrido')
  }

  async function enviar({ aprendizaje, comentario }) {
    await cerrarBitacora(bitacora.id, { aprendizaje, comentario })
    setResumen({
      nombreVisitante: bitacora.nombreVisitante,
      vistos: contarVistos(observaciones ?? []),
      total: (indicadores ?? []).length,
    })
    setBitacora(null)
    setEtapa('gracias')
  }

  function nuevaBitacora() {
    setResumen(null)
    setEtapa('bienvenida')
  }

  if (etapa === 'cargando' || !indicadores) return <p className="muted">Cargando…</p>

  switch (etapa) {
    case 'bienvenida':
      return <Bienvenida indicadores={indicadores} onIniciar={iniciar} />

    case 'recorrido':
      return (
        <Recorrido
          bitacora={bitacora}
          indicadores={indicadores}
          observaciones={observaciones ?? []}
          onAbrir={abrirIndicador}
          onTerminar={() => setEtapa('cierre')}
        />
      )

    case 'detalle': {
      const indicador = indicadores.find((i) => i.id === indicadorActualId)
      const observacion = (observaciones ?? []).find((o) => o.indicadorId === indicadorActualId)
      return (
        <Detalle
          key={indicador.id}
          indicador={indicador}
          observacion={observacion}
          bitacoraId={bitacora.id}
          onVolver={volverAlRecorrido}
        />
      )
    }

    case 'cierre':
      return <Cierre bitacora={bitacora} onVolver={() => setEtapa('recorrido')} onEnviar={enviar} />

    case 'gracias':
      return <Gracias resumen={resumen} onNueva={nuevaBitacora} />

    default:
      return null
  }
}
