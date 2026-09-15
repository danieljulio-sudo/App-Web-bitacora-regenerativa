import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../lib/db.js'
import { obtenerBorrador, crearBorrador, cerrarBitacora } from '../../lib/bitacoraVisitante.js'
import { sincronizarPendientes } from '../../lib/sincronizar.js'
import { t } from '../../i18n/textos.js'
import '../visitante/Visitante.css'
import Estaciones from '../visitante/Estaciones.jsx'
import Estacion from '../visitante/Estacion.jsx'
import Indicador from '../visitante/Indicador.jsx'

const textos = { ...t('es'), terminarRecorrido: 'Terminar mi observación' }

// RF-12: el guía también registra observaciones propias, con la misma
// pantalla que usa el visitante — reutilizamos Estaciones/Estacion/
// Indicador tal cual, en vez de duplicarlas. La diferencia es la bitácora
// que las envuelve: origen "guia", sin bienvenida (ya sabemos quién es) y
// sin preguntas de cierre (esas son de percepción del visitante).
export default function ObservacionPropia({ recorrido, ruta, perfil, onCerrar }) {
  const [etapa, setEtapa] = useState('cargando')
  const [bitacora, setBitacora] = useState(null)
  const [estacionActualId, setEstacionActualId] = useState(null)
  const [indicadorActualId, setIndicadorActualId] = useState(null)

  const observaciones = useLiveQuery(
    () => (bitacora ? db.observaciones.where('bitacoraId').equals(bitacora.id).toArray() : []),
    [bitacora?.id],
    [],
  )

  useEffect(() => {
    let activo = true
    obtenerBorrador(recorrido.rutaId).then(async (borrador) => {
      if (!activo) return
      if (borrador && borrador.origen === 'guia' && borrador.recorridoId === recorrido.id) {
        setBitacora(borrador)
      } else {
        const nueva = await crearBorrador({
          rutaId: recorrido.rutaId, recorridoId: recorrido.id, origen: 'guia', idioma: 'es',
          nombreVisitante: perfil?.nombre || 'Guía',
        })
        if (!activo) return
        setBitacora(nueva)
      }
      if (activo) setEtapa('estaciones')
    })
    return () => { activo = false }
  }, [recorrido.id, recorrido.rutaId, perfil?.nombre])

  function abrirEstacion(id) { setEstacionActualId(id); setEtapa('estacion') }
  function abrirIndicador(id) { setIndicadorActualId(id); setEtapa('indicador') }
  function volverAEstaciones() { setEstacionActualId(null); setEtapa('estaciones') }
  function volverAEstacion() { setIndicadorActualId(null); setEtapa('estacion') }

  async function terminar() {
    await cerrarBitacora(bitacora.id)
    sincronizarPendientes()
    onCerrar()
  }

  if (etapa === 'cargando' || !bitacora) return <p className="muted">Cargando…</p>

  if (etapa === 'estaciones') {
    return (
      <Estaciones
        bitacora={bitacora}
        estaciones={ruta.estaciones}
        observaciones={observaciones ?? []}
        idioma="es"
        textos={textos}
        onAbrir={abrirEstacion}
        onTerminar={terminar}
      />
    )
  }

  if (etapa === 'estacion') {
    const estacion = ruta.estaciones.find((e) => e.id === estacionActualId)
    return <Estacion estacion={estacion} observaciones={observaciones ?? []} bitacoraId={bitacora.id} idioma="es" textos={textos} onAbrir={abrirIndicador} onVolver={volverAEstaciones} />
  }

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
      idioma="es"
      textos={textos}
      onVolver={volverAEstacion}
    />
  )
}
