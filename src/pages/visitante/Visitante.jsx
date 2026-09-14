import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../lib/db.js'
import { cargarRuta } from '../../lib/ruta.js'
import {
  obtenerBorrador, crearBorrador, cerrarBitacora, guardarRespuestas, contarVistos, todosLosIndicadores,
} from '../../lib/bitacoraVisitante.js'
import { sincronizarPendientes } from '../../lib/sincronizar.js'
import { useIdioma } from '../../i18n/IdiomaContext.jsx'
import './Visitante.css'
import Bienvenida from './Bienvenida.jsx'
import Estaciones from './Estaciones.jsx'
import Estacion from './Estacion.jsx'
import Indicador from './Indicador.jsx'
import Cierre from './Cierre.jsx'
import Gracias from './Gracias.jsx'

// Esta pantalla es una "máquina de estados": en cada momento estamos en una
// sola de estas etapas, y cada acción del visitante nos mueve a la
// siguiente. `codigo` viene de la dirección /r/:codigo — es el QR que el
// visitante escaneó al empezar (RF-01). Sin código no hay ruta que mostrar.
export default function Visitante() {
  const { codigo } = useParams()
  const { idioma, setIdioma, textos } = useIdioma()

  const [etapa, setEtapa] = useState('cargando') // cargando | sin-ruta | no-encontrada | bienvenida | estaciones | estacion | indicador | cierre | gracias
  const [ruta, setRuta] = useState(null) // { ruta, estaciones, preguntas }
  const [bitacora, setBitacora] = useState(null)
  const [estacionActualId, setEstacionActualId] = useState(null)
  const [indicadorActualId, setIndicadorActualId] = useState(null)
  const [resumen, setResumen] = useState(null) // solo para la pantalla de "gracias"

  const observaciones = useLiveQuery(
    () => (bitacora ? db.observaciones.where('bitacoraId').equals(bitacora.id).toArray() : []),
    [bitacora?.id],
    [],
  )

  useEffect(() => {
    if (!codigo) {
      setEtapa('sin-ruta')
      return
    }
    let activo = true
    cargarRuta(codigo).then(async (bundle) => {
      if (!activo) return
      if (!bundle) {
        setEtapa('no-encontrada')
        return
      }
      setRuta(bundle)
      const borrador = await obtenerBorrador(bundle.ruta.id)
      if (!activo) return
      if (borrador) {
        setBitacora(borrador)
        setEtapa('estaciones')
      } else {
        setEtapa('bienvenida')
      }
    })
    return () => {
      activo = false
    }
  }, [codigo])

  async function iniciar({ nombreVisitante, pais, correo }) {
    const nueva = await crearBorrador({ rutaId: ruta.ruta.id, idioma, nombreVisitante, pais, correo })
    setBitacora(nueva)
    setEtapa('estaciones')
  }

  function abrirEstacion(id) {
    setEstacionActualId(id)
    setEtapa('estacion')
  }

  function abrirIndicador(id) {
    setIndicadorActualId(id)
    setEtapa('indicador')
  }

  function volverAEstaciones() {
    setEstacionActualId(null)
    setEtapa('estaciones')
  }

  function volverAEstacion() {
    setIndicadorActualId(null)
    setEtapa('estacion')
  }

  async function enviar(valores) {
    await guardarRespuestas(bitacora.id, ruta.preguntas, valores)
    await cerrarBitacora(bitacora.id)
    setResumen({
      nombreVisitante: bitacora.nombreVisitante,
      vistos: contarVistos(observaciones ?? []),
      total: todosLosIndicadores(ruta.estaciones).length,
    })
    setBitacora(null)
    setEtapa('gracias')
    sincronizarPendientes() // no se espera: si hay señal, sube sola en segundo plano
  }

  function nuevaBitacora() {
    setResumen(null)
    setEtapa('bienvenida')
  }

  if (etapa === 'sin-ruta') {
    return (
      <>
        <p className="eyebrow">Bitácora Regenerativa</p>
        <h1>{textos.sinRutaTitulo}</h1>
        <p>{textos.sinRutaTexto}</p>
        <p className="muted">
          <Link to="/r/ruta-cacao">/r/ruta-cacao →</Link> (ruta de ejemplo, para probar)
        </p>
      </>
    )
  }

  if (etapa === 'no-encontrada') {
    return (
      <>
        <p className="eyebrow">Bitácora Regenerativa</p>
        <h1>{textos.rutaNoEncontrada}</h1>
      </>
    )
  }

  if (etapa === 'cargando' || !ruta) return <p className="muted">{textos.cargando}</p>

  switch (etapa) {
    case 'bienvenida':
      return (
        <Bienvenida
          ruta={ruta.ruta}
          indicadores={todosLosIndicadores(ruta.estaciones)}
          idioma={idioma}
          setIdioma={setIdioma}
          textos={textos}
          onIniciar={iniciar}
        />
      )

    case 'estaciones':
      return (
        <Estaciones
          bitacora={bitacora}
          estaciones={ruta.estaciones}
          observaciones={observaciones ?? []}
          idioma={idioma}
          textos={textos}
          onAbrir={abrirEstacion}
          onTerminar={() => setEtapa('cierre')}
        />
      )

    case 'estacion': {
      const estacion = ruta.estaciones.find((e) => e.id === estacionActualId)
      return (
        <Estacion
          estacion={estacion}
          observaciones={observaciones ?? []}
          idioma={idioma}
          textos={textos}
          onAbrir={abrirIndicador}
          onVolver={volverAEstaciones}
        />
      )
    }

    case 'indicador': {
      const estacion = ruta.estaciones.find((e) => e.id === estacionActualId)
      const indicador = estacion.indicadores.find((i) => i.id === indicadorActualId)
      const observacion = (observaciones ?? []).find((o) => o.indicadorId === indicadorActualId && o.estacionId === estacionActualId)
      return (
        <Indicador
          key={indicador.id}
          indicador={indicador}
          observacion={observacion}
          estacionId={estacion.id}
          bitacoraId={bitacora.id}
          idioma={idioma}
          textos={textos}
          onVolver={volverAEstacion}
        />
      )
    }

    case 'cierre':
      return <Cierre preguntas={ruta.preguntas} idioma={idioma} textos={textos} onVolver={() => setEtapa('estaciones')} onEnviar={enviar} />

    case 'gracias':
      return <Gracias resumen={resumen} textos={textos} onNueva={nuevaBitacora} />

    default:
      return null
  }
}
