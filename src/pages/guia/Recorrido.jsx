import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Check, ChevronLeft, Download, Pencil, Plus, X } from 'lucide-react'
import { useSesion } from '../../lib/sesion.jsx'
import { cargarRutaPorId } from '../../lib/ruta.js'
import { obtenerRecorrido, cerrarRecorrido, marcarValidado, resumenRecorrido, validarObservacion } from '../../lib/recorridoGuia.js'
import { exportarRecorridoExcel } from '../../lib/exportar.js'
import { campo } from '../../i18n/textos.js'
import { cn } from '../../lib/utils.js'
import ObservacionPropia from './ObservacionPropia.jsx'

const TINTE_DECISION = {
  confirmada: 'bg-leaf-soft text-leaf-deep',
  ajustada: 'bg-pollen-soft text-accent-foreground',
  descartada: 'bg-cacao-soft text-cacao',
}

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
  const [editando, setEditando] = useState(null) // `${estacionId}:${indicadorId}` o null
  const [borrador, setBorrador] = useState('')

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

  function abrirAjuste(estacionId, indicadorId, valorSugerido) {
    setEditando(`${estacionId}:${indicadorId}`)
    setBorrador(valorSugerido != null ? String(valorSugerido) : '')
  }

  async function guardarAjuste(estacionId, indicadorId) {
    const numero = Number(borrador)
    if (borrador.trim() === '' || Number.isNaN(numero)) return
    await validar(estacionId, indicadorId, 'ajustada', numero)
    setEditando(null)
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

  if (cargando) return <p className="text-muted-foreground">Cargando…</p>
  if (error) {
    return (
      <div className="mx-auto w-full max-w-[30rem]">
        <h2 className="font-display text-xl text-ink">{error}</h2>
        <Link to="/guia" className="mt-4 inline-block rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink-soft">Volver</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[30rem] flex-col gap-6">
      <div>
        <Link to="/guia" className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-leaf">
          <ChevronLeft className="size-3.5" /> Tus recorridos
        </Link>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{ruta.ruta.nombre} · {recorrido.estado}</p>
        <h1 className="font-display text-2xl text-ink">Recorrido del {new Date(recorrido.iniciadoEn).toLocaleDateString('es-CO')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {resumen.bitacoras.length} bitácoras registradas{recorrido.tamanoGrupo ? ` · grupo de ${recorrido.tamanoGrupo}` : ''}
        </p>
      </div>

      {ruta.estaciones.map((estacion) => (
        <div key={estacion.id}>
          <h2 className="font-display text-sm uppercase tracking-[0.14em] text-muted-foreground">{campo(estacion, 'nombre', 'es')}</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {estacion.indicadores.map((indicador) => {
              const agregado = resumen.agregados.find((a) => a.estacionId === estacion.id && a.indicadorId === indicador.id)
              const valor = !agregado ? '—'
                : indicador.tipoMedicion === 'conteo' ? `prom. ${agregado.promedioCantidad}`
                : indicador.tipoMedicion === 'escala' ? `prom. ${agregado.promedioEscala ?? '—'} / 5`
                : '—'
              const decision = agregado?.validacion?.decision
              const valorMostrado = decision === 'ajustada' ? `${agregado.validacion.valor_final} (ajustado)` : valor
              const valorSugerido = indicador.tipoMedicion === 'conteo' ? agregado?.promedioCantidad : agregado?.promedioEscala
              const clave = `${estacion.id}:${indicador.id}`

              return (
                <li key={indicador.id} className="rounded-xl border border-line bg-surface p-4 shadow-[0_1px_0_rgba(36,33,28,0.04)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{indicador.emoji} {campo(indicador, 'nombre', 'es')}</p>
                      <p className="text-xs text-muted-foreground">{agregado ? `${agregado.vistos} / ${agregado.total} vistos` : 'Sin registros'}{agregado?.conFoto ? ` · ${agregado.conFoto} con foto` : ''}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-paper px-2.5 py-1 font-display text-sm text-leaf-deep">{valorMostrado}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {decision && <span className={cn('rounded-md px-2 py-0.5 text-[0.7rem]', TINTE_DECISION[decision])}>{decision}</span>}
                    <button
                      onClick={() => validar(estacion.id, indicador.id, 'confirmada')}
                      className={cn('inline-flex items-center gap-1 rounded-md border border-leaf/40 px-2.5 py-1 text-xs text-leaf-deep', decision === 'confirmada' && 'bg-leaf-soft')}
                    >
                      <Check className="size-3.5" /> Confirmar
                    </button>
                    <button
                      onClick={() => abrirAjuste(estacion.id, indicador.id, valorSugerido)}
                      className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs text-ink-soft"
                    >
                      <Pencil className="size-3.5" /> Ajustar
                    </button>
                    <button
                      onClick={() => validar(estacion.id, indicador.id, 'descartada')}
                      className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs text-cacao"
                    >
                      <X className="size-3.5" /> Descartar
                    </button>
                  </div>

                  {editando === clave && (
                    <div className="mt-3 space-y-2 rounded-md border border-line bg-paper p-3">
                      <input
                        value={borrador} onChange={(e) => setBorrador(e.target.value)} autoFocus
                        placeholder="Valor final" inputMode="decimal"
                        className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-leaf"
                      />
                      <button
                        onClick={() => guardarAjuste(estacion.id, indicador.id)}
                        className="w-full rounded-md bg-leaf px-3 py-2 text-sm font-semibold text-primary-foreground"
                      >
                        Guardar ajuste
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}

      <div className="flex flex-col gap-3 pb-6">
        <button
          onClick={() => setMostrarPropia(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-leaf bg-leaf-soft px-5 py-3 font-medium text-leaf-deep transition-colors hover:bg-leaf-soft/70"
        >
          <Plus className="size-4" /> Agregar mi observación
        </button>
        {recorrido.estado === 'abierto' && (
          <button onClick={cerrar} className="w-full rounded-xl bg-leaf px-5 py-3.5 font-display font-semibold text-primary-foreground">
            Cerrar recorrido
          </button>
        )}
        {recorrido.estado === 'cerrado' && (
          <button onClick={validarTodo} className="w-full rounded-xl bg-leaf px-5 py-3.5 font-display font-semibold text-primary-foreground">
            Marcar recorrido como validado
          </button>
        )}
        <button
          onClick={exportar}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 font-medium text-ink-soft"
        >
          <Download className="size-4" /> Exportar a Excel
        </button>
      </div>
    </div>
  )
}
