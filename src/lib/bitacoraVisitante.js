import { db } from './db.js'

// Todo lo que necesita la app del visitante (y, reusado, la observación
// propia del guía — RF-12) para leer y guardar en la base local vive en
// este archivo. Los componentes de React no escriben Dexie directamente:
// llaman a estas funciones con nombre claro.

// Solo puede haber una bitácora "en curso" (borrador) a la vez por ruta en
// este celular.
export function obtenerBorrador(rutaId) {
  return db.bitacoras.where({ estado: 'borrador', rutaId }).first()
}

export async function crearBorrador({ rutaId, recorridoId = null, origen = 'visitante', idioma = 'es', nombreVisitante, pais, correo }) {
  const bitacora = {
    id: crypto.randomUUID(),
    estado: 'borrador',
    rutaId,
    recorridoId,
    origen, // 'visitante' | 'guia' (RF-12: observación propia del guía)
    idioma,
    creadaEn: new Date().toISOString(),
    nombreVisitante,
    pais: pais || null,
    correo: correo || null,
  }
  await db.bitacoras.add(bitacora)
  return bitacora
}

export function obtenerObservaciones(bitacoraId) {
  return db.observaciones.where('bitacoraId').equals(bitacoraId).toArray()
}

// Un indicador solo tiene una observación por bitácora, así que el id se
// arma con los tres ("bitacoraId:estacionId:indicadorId"): guardar dos
// veces el mismo indicador sobreescribe la respuesta anterior en vez de
// duplicarla.
export function idObservacion(bitacoraId, estacionId, indicadorId) {
  return `${bitacoraId}:${estacionId}:${indicadorId}`
}

// `respuesta` trae lo que aplique según el tipo de medición del indicador
// (RF-04: conteo, sí/no, escala y foto) — el resto se guarda vacío para no
// dejar basura de un tipo que no corresponde.
export async function guardarObservacion(bitacoraId, estacionId, indicador, { visto, cantidad, escala }) {
  const id = idObservacion(bitacoraId, estacionId, indicador.id)
  const previa = await db.observaciones.get(id)
  const tieneFoto = visto ? Boolean(previa?.tieneFoto) : false
  await db.observaciones.put({
    id,
    bitacoraId,
    estacionId,
    indicadorId: indicador.id,
    visto,
    cantidad: visto && indicador.tipoMedicion === 'conteo' ? (cantidad ?? 1) : 0,
    escala: visto && indicador.tipoMedicion === 'escala' ? (escala ?? null) : null,
    tieneFoto,
  })
  if (!visto) await eliminarFoto(id)
  return id
}

// "Hallazgo": algo que el visitante o el guía vieron en una estación y que
// NO está en el catálogo todavía. A diferencia de guardarObservacion() (un
// slot fijo por indicador), aquí puede haber varios por estación — cada uno
// con su propio id, así que no se sobreescriben entre sí. Se guardan como
// una observación más (mismo pipeline de sincronización) pero con
// `indicadorId: null` y su nombre suelto en `nombreLibre`; el admin decide
// después, desde el panel, si pasan a ser un indicador oficial.
export async function crearHallazgo(bitacoraId, estacionId, nombreLibre) {
  const id = `${bitacoraId}:${estacionId}:libre:${crypto.randomUUID()}`
  await db.observaciones.put({
    id,
    bitacoraId,
    estacionId,
    indicadorId: null,
    nombreLibre,
    visto: true,
    cantidad: 0,
    escala: null,
    tieneFoto: false,
  })
  return id
}

export async function eliminarHallazgo(id) {
  await eliminarFoto(id)
  await db.observaciones.delete(id)
}

export function obtenerFoto(observacionId) {
  return db.fotos.get(observacionId)
}

// La foto usa el mismo id que su observación: como mucho hay una foto por
// observación, y guardar una nueva reemplaza la anterior sola.
export async function guardarFoto(observacionId, dataUrl) {
  await db.fotos.put({ id: observacionId, observacionId, dataUrl, creadaEn: new Date().toISOString() })
  await db.observaciones.update(observacionId, { tieneFoto: true })
}

export async function eliminarFoto(observacionId) {
  await db.fotos.delete(observacionId)
  await db.observaciones.update(observacionId, { tieneFoto: false })
}

// Preguntas de cierre (RF-06): `valores` es { [preguntaId]: numero|texto },
// tal como las junta la pantalla de Cierre. Cada pregunta define su propio
// tipo, así que aquí decidimos en cuál columna va cada respuesta.
export async function guardarRespuestas(bitacoraId, preguntas, valores) {
  const filas = preguntas.map((p) => ({
    id: `${bitacoraId}:${p.id}`,
    bitacoraId,
    preguntaId: p.id,
    valorNum: p.tipo === 'escala' ? (valores[p.id] ?? null) : null,
    valorTexto: p.tipo === 'texto' ? (valores[p.id] ?? '') : null,
  }))
  await db.respuestas.bulkPut(filas)
}

// Cierra el borrador: pasa de "borrador" a "pendiente" (lista para subir a
// Supabase cuando haya señal). A partir de aquí ya no se edita.
export async function cerrarBitacora(bitacoraId) {
  await db.bitacoras.update(bitacoraId, { estado: 'pendiente', enviadaEn: new Date().toISOString() })
}

export function contarVistos(observaciones) {
  return observaciones.filter((o) => o.visto).length
}

// Aplana las estaciones de una ruta en una sola lista de indicadores, en el
// orden en que aparecen — sirve para el resumen final ("viste 8 de 12").
export function todosLosIndicadores(estaciones) {
  return estaciones.flatMap((e) => e.indicadores)
}
