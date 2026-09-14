import { useEffect, useState } from 'react'
import {
  listarRutas, crearRuta, listarEstaciones, guardarEstacion, eliminarEstacion,
  asignarIndicador, quitarIndicador, listarIndicadores,
} from '../../lib/admin.js'
import { generarQR, urlDeRuta } from '../../lib/qr.js'

const RUTA_VACIA = { nombre: '', codigo: '', descripcion: '' }
const ESTACION_VACIA = { id: null, orden: 0, nombre_es: '', nombre_en: '', descripcion_es: '', descripcion_en: '' }

// RF-14 (rutas y estaciones) y RF-15 (QR de cada ruta). Una finca chica
// suele tener pocas rutas, así que el panel es de una sola pantalla: lista
// de rutas arriba, y al elegir una, sus estaciones e indicadores abajo.
export default function Rutas() {
  const [rutas, setRutas] = useState(null)
  const [indicadores, setIndicadores] = useState([])
  const [formRuta, setFormRuta] = useState(RUTA_VACIA)
  const [seleccionadaId, setSeleccionadaId] = useState(null)
  const [estaciones, setEstaciones] = useState(null)
  const [formEstacion, setFormEstacion] = useState(ESTACION_VACIA)
  const [qr, setQr] = useState(null)

  async function recargarRutas() {
    setRutas(await listarRutas())
  }

  useEffect(() => {
    recargarRutas()
    listarIndicadores().then(setIndicadores)
  }, [])

  async function crear(e) {
    e.preventDefault()
    await crearRuta(formRuta)
    setFormRuta(RUTA_VACIA)
    await recargarRutas()
  }

  async function elegir(ruta) {
    setSeleccionadaId(ruta.id)
    setEstaciones(await listarEstaciones(ruta.id))
    setQr(await generarQR(ruta.codigo))
  }

  async function recargarEstaciones() {
    setEstaciones(await listarEstaciones(seleccionadaId))
  }

  async function guardarEst(e) {
    e.preventDefault()
    await guardarEstacion(seleccionadaId, formEstacion)
    setFormEstacion(ESTACION_VACIA)
    await recargarEstaciones()
  }

  function editarEst(e) {
    setFormEstacion({ id: e.id, orden: e.orden, nombre_es: e.nombre_es, nombre_en: e.nombre_en || '', descripcion_es: e.descripcion_es || '', descripcion_en: e.descripcion_en || '' })
  }

  const rutaSeleccionada = rutas?.find((r) => r.id === seleccionadaId)

  return (
    <>
      <h2>Nueva ruta</h2>
      <form onSubmit={crear}>
        <label htmlFor="rnombre">Nombre</label>
        <input id="rnombre" required value={formRuta.nombre} onChange={(e) => setFormRuta({ ...formRuta, nombre: e.target.value })} />
        <label htmlFor="rcodigo">Código para el QR (sin espacios)</label>
        <input id="rcodigo" required pattern="[a-z0-9-]+" placeholder="ruta-cacao" value={formRuta.codigo} onChange={(e) => setFormRuta({ ...formRuta, codigo: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} />
        <label htmlFor="rdesc">Descripción</label>
        <input id="rdesc" value={formRuta.descripcion} onChange={(e) => setFormRuta({ ...formRuta, descripcion: e.target.value })} />
        <div className="stack"><button className="btn" type="submit">Crear ruta</button></div>
      </form>

      <h2 style={{ marginTop: 28 }}>Tus rutas</h2>
      <div className="tarjetas">
        {rutas?.map((r) => (
          <button key={r.id} type="button" className="tarjeta estacion" style={{ padding: 14 }} onClick={() => elegir(r)}>
            <div className="tarjeta-body">
              <div className="tarjeta-nombre">{r.nombre}</div>
              <div className="tarjeta-pista">/r/{r.codigo} · {r.activa ? 'activa' : 'inactiva'}</div>
            </div>
          </button>
        ))}
      </div>

      {rutaSeleccionada && (
        <>
          <h2 style={{ marginTop: 28 }}>QR de "{rutaSeleccionada.nombre}"</h2>
          {qr && (
            <div className="card" style={{ textAlign: 'center' }}>
              <img src={qr} alt={`QR de ${rutaSeleccionada.nombre}`} style={{ width: 220, height: 220 }} />
              <p className="muted" style={{ wordBreak: 'break-all' }}>{urlDeRuta(rutaSeleccionada.codigo)}</p>
              <button className="btn ghost" type="button" onClick={() => window.print()}>Imprimir</button>
            </div>
          )}

          <h2 style={{ marginTop: 28 }}>Estaciones</h2>
          <form onSubmit={guardarEst}>
            <label htmlFor="eorden">Orden</label>
            <input id="eorden" type="number" value={formEstacion.orden} onChange={(e) => setFormEstacion({ ...formEstacion, orden: Number(e.target.value) })} />
            <label htmlFor="enombre_es">Nombre (español)</label>
            <input id="enombre_es" required value={formEstacion.nombre_es} onChange={(e) => setFormEstacion({ ...formEstacion, nombre_es: e.target.value })} />
            <label htmlFor="enombre_en">Nombre (inglés)</label>
            <input id="enombre_en" value={formEstacion.nombre_en} onChange={(e) => setFormEstacion({ ...formEstacion, nombre_en: e.target.value })} />
            <label htmlFor="edesc_es">Descripción (español)</label>
            <input id="edesc_es" value={formEstacion.descripcion_es} onChange={(e) => setFormEstacion({ ...formEstacion, descripcion_es: e.target.value })} />
            <div className="stack" style={{ display: 'grid', gridTemplateColumns: formEstacion.id ? '1fr 1fr' : '1fr' }}>
              <button className="btn" type="submit">{formEstacion.id ? 'Guardar cambios' : 'Agregar estación'}</button>
              {formEstacion.id && <button className="btn ghost" type="button" onClick={() => setFormEstacion(ESTACION_VACIA)}>Cancelar</button>}
            </div>
          </form>

          {estaciones?.map((est) => {
            const idsAsignados = new Set(est.estacion_indicadores.map((v) => v.indicador_id))
            return (
              <div key={est.id} className="card" style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b>{est.orden}. {est.nombre_es}</b>
                  <div className="fila-validacion">
                    <button className="pill" type="button" onClick={() => editarEst(est)}>Editar</button>
                    <button className="pill off" type="button" onClick={() => eliminarEstacion(est.id).then(recargarEstaciones)}>Borrar</button>
                  </div>
                </div>
                <p className="muted" style={{ margin: '8px 0' }}>Indicadores en esta estación:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {indicadores.map((i) => {
                    const asignado = idsAsignados.has(i.id)
                    return (
                      <button
                        key={i.id}
                        type="button"
                        className={asignado ? 'pill' : 'pill off'}
                        onClick={() => (asignado ? quitarIndicador(est.id, i.id) : asignarIndicador(est.id, i.id)).then(recargarEstaciones)}
                      >
                        {i.emoji} {i.nombre_es}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </>
      )}
    </>
  )
}
