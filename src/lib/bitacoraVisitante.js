import { db } from './db.js'

// Todo lo que necesita la pantalla de Visitante para leer y guardar en la
// base local vive en este archivo. Los componentes de React no escriben
// Dexie directamente: llaman a estas funciones con nombre claro. Así, si
// mañana cambia cómo se guarda algo, solo se toca aquí.

// Solo puede haber una bitácora "en curso" (borrador) a la vez en este
// celular — igual que en el prototipo, que guardaba un único "draft".
export function obtenerBorrador() {
  return db.bitacoras.where('estado').equals('borrador').first()
}

export async function crearBorrador({ nombreVisitante, pais }) {
  const bitacora = {
    id: crypto.randomUUID(),
    estado: 'borrador',
    creadaEn: new Date().toISOString(),
    nombreVisitante,
    pais,
    aprendizaje: null,
    comentario: '',
  }
  await db.bitacoras.add(bitacora)
  return bitacora
}

export function obtenerObservaciones(bitacoraId) {
  return db.observaciones.where('bitacoraId').equals(bitacoraId).toArray()
}

// Un indicador solo tiene una observación por bitácora, así que el id se
// arma con los dos ("bitacoraId:indicadorId"): guardar dos veces el mismo
// indicador sobreescribe la respuesta anterior en vez de duplicarla.
export function idObservacion(bitacoraId, indicadorId) {
  return `${bitacoraId}:${indicadorId}`
}

export async function guardarObservacion(bitacoraId, indicadorId, { visto, cantidad }) {
  const id = idObservacion(bitacoraId, indicadorId)
  const previa = await db.observaciones.get(id)
  const tieneFoto = visto ? Boolean(previa?.tieneFoto) : false
  await db.observaciones.put({ id, bitacoraId, indicadorId, visto, cantidad: visto ? cantidad : 0, tieneFoto })
  if (!visto) await eliminarFoto(id)
  return id
}

export function obtenerFoto(observacionId) {
  return db.fotos.get(observacionId)
}

// La foto usa el mismo id que su observación: como mucho hay una foto por
// observación, y guardar una nueva reemplaza la anterior sola. Además
// marcamos tieneFoto en la observación para que la tarjeta de la lista no
// tenga que consultar la tabla de fotos solo para mostrar el sello "📷".
export async function guardarFoto(observacionId, dataUrl) {
  await db.fotos.put({ id: observacionId, observacionId, dataUrl, creadaEn: new Date().toISOString() })
  await db.observaciones.update(observacionId, { tieneFoto: true })
}

export async function eliminarFoto(observacionId) {
  await db.fotos.delete(observacionId)
  await db.observaciones.update(observacionId, { tieneFoto: false })
}

// Cierra el borrador: pasa de "borrador" a "pendiente" (lista para subir a
// Supabase cuando haya señal). A partir de aquí ya no se edita.
export async function cerrarBitacora(bitacoraId, { aprendizaje, comentario }) {
  await db.bitacoras.update(bitacoraId, {
    estado: 'pendiente',
    aprendizaje,
    comentario,
    enviadaEn: new Date().toISOString(),
  })
}

export function contarVistos(observaciones) {
  return observaciones.filter((o) => o.visto).length
}
