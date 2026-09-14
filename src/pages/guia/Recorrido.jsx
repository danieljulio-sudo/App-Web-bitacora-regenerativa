import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSesion } from '../../lib/sesion.jsx'
import { cargarRutaPorId } from '../../lib/ruta.js'
import { obtenerRecorrido, cerrarRecorrido, marcarValidado, resumenRecorrido, validarObservacion } from '../../lib/recorridoGuia.js'
import { exportarRecorridoExcel } from '../../lib/exportar.js'
import { campo } from '../../i18n/textos.js'
import ObservacionPropia from './ObservacionPropia.jsx'

// RF-10 y RF-11: lo que el grupo marcó, agrupado por estación e indicador
// (no visitante por visitante), con botones para confirmar, ajustar o
// descartar cada observación agregada. RF-12 vive en un botón aparte que
// abre ObservacionPropia.jsx. Necesita señal: es la pantalla del guía, y a
// diferencia del visitante, siempre trabaja contra Supabase directo.
export default function Recorrido() {
  const { id } = useParams()
  const { usuario, perfil } = useSesion()

  const [recorrido, setRecorrido] = useState(null)
  const [ruta, setRuta] = useState(null)
  const [resumen, setResumen] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mostrarPropia, setMostrarPropia] = useState(false)

  async function cargarTodo() {
    setCargando(true)
    setError('')
    try {
      const rec = await obtenerRecorrido(id)
      if (!rec) throw new Error('No encontramos este recorrido.')
      setRecorrido(rec)
      const [rutaBundle, res] = await Promise.all([cargarRutaPorId(rec.rutaId), resumenRecorrido(rec)])
      setRuta(rutaBundle)
      setResumen(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargarTodo() }, [id])

  async function validar(estacionId, indicadorId, decision, valorFinal) {
    await validarObservacion(id, estacionId, indicadorId, { decision, valorFinal }, usuario.id)
    cargarTodo()
  }

  function ajustar(estacionId, indicadorId, valorSugerido) {
    const texto = window.prompt('Valor final para este indicador en este recorrido:', valorSugerido ?? '')
    if (texto === null || texto.trim() === '') return
    const numero = Number(texto)
    if (Number.isNaN(numero)) return
    validar(estacionId, indicadorId, 'ajustada', numero)
  }

  async function cerrar() {
    await cerrarRecorrido(id)
    cargarTodo()
  }

  async function validarTodo() {
    await marcarValidado(id)
    cargarTodo()
  }

  async function exportar() {
    await exportarRecorridoExcel(recorrido, ruta.ruta)
  }

  if (mostrarPropia && ruta && recorrido) {
    return <ObservacionPropia recorrido={recorrido} ruta={ruta} perfil={perfil} onCerrar={() => { setMostrarPropia(false); cargarTodo() }} />
  }

  if (cargando) return <p className="muted">Cargando…</p>
  if (error) return <><p className="eyebrow">Recorrido</p><h2>{error}</h2><Link className="btn ghost" to="/guia">Volver</Link></>

  return (
    <>
      <Link className="back" to="/guia">← Tus recorridos</Link>
      <p className="eyebrow">{ruta.ruta.nombre} · {recorrido.estado}</p>
      <h1>Recorrido del {new Date(recorrido.iniciadoEn).toLocaleDateString('es-CO')}</h1>
      <p className="muted">{resumen.bitacoras.length} bitácoras registradas{recorrido.tamanoGrupo ? ` · grupo de ${recorrido.tamanoGrupo}` : ''}</p>

      {ruta.estaciones.map((estacion) => (
        <div key={estacion.id} style={{ marginTop: 20 }}>
          <h2>{campo(estacion, 'nombre', 'es')}</h2>
          <div className="tabla-envoltura">
            <table className="tabla">
              <thead>
                <tr><th>Indicador</th><th>Visto</th><th>Valor</th><th>Foto</th><th>Validación</th></tr>
              </thead>
              <tbody>
                {estacion.indicadores.map((indicador) => {
                  const agregado = resumen.agregados.find((a) => a.estacionId === estacion.id && a.indicadorId === indicador.id)
                  const valor = !agregado ? '—'
                    : indicador.tipoMedicion === 'conteo' ? `prom. ${agregado.promedioCantidad}`
                    : indicador.tipoMedicion === 'escala' ? `prom. ${agregado.promedioEscala ?? '—'} / 5`
                    : '—'
                  const decision = agregado?.validacion?.decision
                  const valorSugerido = indicador.tipoMedicion === 'conteo' ? agregado?.promedioCantidad : agregado?.promedioEscala
                  return (
                    <tr key={indicador.id}>
                      <td>{indicador.emoji} {campo(indicador, 'nombre', 'es')}</td>
                      <td>{agregado ? `${agregado.vistos} / ${agregado.total}` : '0 / 0'}</td>
                      <td>{decision === 'ajustada' ? `${agregado.validacion.valor_final} (ajustado)` : valor}</td>
                      <td>{agregado?.conFoto ? `${agregado.conFoto} 📷` : '—'}</td>
                      <td>
                        <div className="fila-validacion">
                          <button type="button" className={decision === 'confirmada' ? 'pill' : 'pill off'} onClick={() => validar(estacion.id, indicador.id, 'confirmada')}>Confirmar</button>
                          <button type="button" className={decision === 'ajustada' ? 'pill' : 'pill off'} onClick={() => ajustar(estacion.id, indicador.id, valorSugerido)}>Ajustar</button>
                          <button type="button" className={decision === 'descartada' ? 'pill' : 'pill off'} onClick={() => validar(estacion.id, indicador.id, 'descartada')}>Descartar</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div className="stack" style={{ marginTop: 24 }}>
        <button className="btn soft" type="button" onClick={() => setMostrarPropia(true)}>+ Agregar mi observación</button>
        {recorrido.estado === 'abierto' && <button className="btn" type="button" onClick={cerrar}>Cerrar recorrido</button>}
        {recorrido.estado === 'cerrado' && <button className="btn" type="button" onClick={validarTodo}>Marcar recorrido como validado</button>}
        <button className="btn ghost" type="button" onClick={exportar}>Exportar a Excel</button>
      </div>
    </>
  )
}
