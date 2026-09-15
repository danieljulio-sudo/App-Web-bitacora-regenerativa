import { useEffect, useState } from 'react'
import { ChevronRight, Pencil, Printer, QrCode, Trash2 } from 'lucide-react'
import {
  listarRutas, crearRuta, actualizarRuta, listarEstaciones, guardarEstacion, eliminarEstacion,
  asignarIndicador, quitarIndicador, listarIndicadores,
} from '../../lib/admin.js'
import { generarQR, urlDeRuta } from '../../lib/qr.js'
import { campoInput, campoLabel, tarjeta, botonPrimario, botonSecundario, chip } from '../../lib/estilosFormulario.js'
import { cn } from '../../lib/utils.js'

const RUTA_VACIA = { id: null, nombre: '', codigo: '', descripcion: '' }
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
    if (formRuta.id) {
      await actualizarRuta(formRuta.id, { nombre: formRuta.nombre, codigo: formRuta.codigo, descripcion: formRuta.descripcion, activa: formRuta.activa })
    } else {
      await crearRuta(formRuta)
    }
    setFormRuta(RUTA_VACIA)
    await recargarRutas()
  }

  function editarRuta(r, e) {
    e.stopPropagation() // no abrir/cerrar sus estaciones al tocar "Editar"
    setFormRuta({ id: r.id, nombre: r.nombre, codigo: r.codigo, descripcion: r.descripcion || '', activa: r.activa })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function alternarActiva(r, e) {
    e.stopPropagation()
    await actualizarRuta(r.id, { nombre: r.nombre, codigo: r.codigo, descripcion: r.descripcion, activa: !r.activa })
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
    <div className="flex flex-col gap-6">
      <div className={tarjeta}>
        <h2 className="font-display text-lg text-ink">{formRuta.id ? 'Editar ruta' : 'Nueva ruta'}</h2>
        <form onSubmit={crear} className="mt-1 grid gap-x-5 sm:grid-cols-2">
          <div>
            <label htmlFor="rnombre" className={campoLabel}>Nombre</label>
            <input id="rnombre" required value={formRuta.nombre} onChange={(e) => setFormRuta({ ...formRuta, nombre: e.target.value })} className={campoInput} />
          </div>
          <div>
            <label htmlFor="rcodigo" className={campoLabel}>Código para el QR (sin espacios)</label>
            <input
              id="rcodigo" required pattern="[a-z0-9-]+" placeholder="ruta-cacao" value={formRuta.codigo}
              onChange={(e) => setFormRuta({ ...formRuta, codigo: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
              className={campoInput}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="rdesc" className={campoLabel}>Descripción</label>
            <input id="rdesc" value={formRuta.descripcion} onChange={(e) => setFormRuta({ ...formRuta, descripcion: e.target.value })} className={campoInput} />
          </div>
          <div className="mt-4 flex gap-3 sm:col-span-2">
            <button type="submit" className={botonPrimario}>{formRuta.id ? 'Guardar cambios' : 'Crear ruta'}</button>
            {formRuta.id && <button type="button" onClick={() => setFormRuta(RUTA_VACIA)} className={botonSecundario}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div>
        <h2 className="font-display text-lg text-ink">Tus rutas</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rutas?.map((r) => (
            <div
              key={r.id} role="button" tabIndex={0} onClick={() => elegir(r)} onKeyDown={(e) => e.key === 'Enter' && elegir(r)}
              className={cn(
                'flex cursor-pointer flex-col gap-2 rounded-xl border bg-surface p-4 text-left transition-colors hover:border-leaf/40',
                seleccionadaId === r.id ? 'border-leaf bg-leaf-soft/40' : 'border-line',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{r.nombre}</p>
                  <p className="text-xs text-muted-foreground">/r/{r.codigo} · {r.activa ? 'activa' : 'inactiva'}</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
              <div className="flex gap-1.5">
                <button type="button" onClick={(e) => editarRuta(r, e)} className={cn(chip, 'bg-leaf-soft text-leaf-deep')}><Pencil className="size-3" /> Editar</button>
                <button type="button" onClick={(e) => alternarActiva(r, e)} className={cn(chip, 'bg-muted text-muted-foreground')}>
                  {r.activa ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {rutaSeleccionada && (
        <>
          {qr && (
            <div className={cn(tarjeta, 'flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left')}>
              <img src={qr} alt={`QR de ${rutaSeleccionada.nombre}`} className="size-40 shrink-0 rounded-lg border border-line" />
              <div className="min-w-0">
                <p className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-ink"><QrCode className="size-4 text-leaf" /> QR de "{rutaSeleccionada.nombre}"</p>
                <p className="mt-1 break-all text-xs text-muted-foreground">{urlDeRuta(rutaSeleccionada.codigo)}</p>
                <button type="button" onClick={() => window.print()} className={cn(botonSecundario, 'mt-3 inline-flex items-center gap-1.5')}>
                  <Printer className="size-4" /> Imprimir
                </button>
              </div>
            </div>
          )}

          <div className={tarjeta}>
            <h2 className="font-display text-lg text-ink">{formEstacion.id ? 'Editar estación' : 'Nueva estación'}</h2>
            <form onSubmit={guardarEst} className="mt-1 grid gap-x-5 sm:grid-cols-2">
              <div>
                <label htmlFor="eorden" className={campoLabel}>Orden</label>
                <input id="eorden" type="number" value={formEstacion.orden} onChange={(e) => setFormEstacion({ ...formEstacion, orden: Number(e.target.value) })} className={campoInput} />
              </div>
              <div>
                <label htmlFor="enombre_es" className={campoLabel}>Nombre (español)</label>
                <input id="enombre_es" required value={formEstacion.nombre_es} onChange={(e) => setFormEstacion({ ...formEstacion, nombre_es: e.target.value })} className={campoInput} />
              </div>
              <div>
                <label htmlFor="enombre_en" className={campoLabel}>Nombre (inglés)</label>
                <input id="enombre_en" value={formEstacion.nombre_en} onChange={(e) => setFormEstacion({ ...formEstacion, nombre_en: e.target.value })} className={campoInput} />
              </div>
              <div>
                <label htmlFor="edesc_es" className={campoLabel}>Descripción (español)</label>
                <input id="edesc_es" value={formEstacion.descripcion_es} onChange={(e) => setFormEstacion({ ...formEstacion, descripcion_es: e.target.value })} className={campoInput} />
              </div>
              <div className="mt-4 flex gap-3 sm:col-span-2">
                <button type="submit" className={botonPrimario}>{formEstacion.id ? 'Guardar cambios' : 'Agregar estación'}</button>
                {formEstacion.id && <button type="button" onClick={() => setFormEstacion(ESTACION_VACIA)} className={botonSecundario}>Cancelar</button>}
              </div>
            </form>
          </div>

          <div className="flex flex-col gap-3">
            {estaciones?.map((est) => {
              const idsAsignados = new Set(est.estacion_indicadores.map((v) => v.indicador_id))
              return (
                <div key={est.id} className={tarjeta}>
                  <div className="flex items-center justify-between gap-3">
                    <b className="text-ink">{est.orden}. {est.nombre_es}</b>
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => editarEst(est)} className={cn(chip, 'bg-leaf-soft text-leaf-deep')}><Pencil className="size-3" /> Editar</button>
                      <button type="button" onClick={() => eliminarEstacion(est.id).then(recargarEstaciones)} className={cn(chip, 'bg-cacao-soft text-cacao')}><Trash2 className="size-3" /> Borrar</button>
                    </div>
                  </div>
                  <p className="mt-2 mb-2 text-sm text-muted-foreground">Indicadores en esta estación:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {indicadores.map((i) => {
                      const asignado = idsAsignados.has(i.id)
                      return (
                        <button
                          key={i.id} type="button"
                          onClick={() => (asignado ? quitarIndicador(est.id, i.id) : asignarIndicador(est.id, i.id)).then(recargarEstaciones)}
                          className={cn(chip, asignado ? 'bg-leaf-soft text-leaf-deep' : 'bg-muted text-muted-foreground')}
                        >
                          {i.emoji} {i.nombre_es}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
