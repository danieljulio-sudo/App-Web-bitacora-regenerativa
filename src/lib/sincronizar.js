import { db } from './db.js'
import { supabase, supabaseListo } from './supabase.js'
import { dataUrlABlob } from './foto.js'

// Código de Postgres para "ya existe una fila con esa llave" (unique_violation).
const YA_EXISTE = '23505'

// Recorre las bitácoras marcadas como "pendiente" en Dexie y las sube a
// Supabase una por una (fotos primero, después la bitácora y sus
// observaciones y respuestas). Si Supabase no está configurado (.env vacío)
// o el celular está sin señal, no hace nada — no es un error, es lo normal.
//
// Usamos inserts lisos (no "upsert"), y si Postgres o Storage responden
// "ya existe" lo tratamos como éxito, no como falla: significa que un
// intento anterior sí llegó a subir eso, y solo nos habíamos quedado sin
// enterarnos (por ejemplo, si la señal se cortó justo después de subir pero
// antes de que la respuesta llegara al celular). Así, llamar esta función
// varias veces —al abrir la app, al volver la señal— es seguro: nunca
// duplica ni se traba con una bitácora que ya subió.
export async function sincronizarPendientes() {
  if (!supabaseListo || !navigator.onLine) return { subidas: 0 }

  const pendientes = await db.bitacoras.where('estado').equals('pendiente').toArray()
  let subidas = 0

  for (const bitacora of pendientes) {
    try {
      await subirBitacora(bitacora)
      await db.bitacoras.update(bitacora.id, { estado: 'sincronizada' })
      subidas++
    } catch (error) {
      // Se queda en "pendiente": la próxima vez que haya señal se reintenta.
      console.warn('No se pudo sincronizar la bitácora', bitacora.id, error)
    }
  }

  return { subidas }
}

async function subirBitacora(bitacora) {
  const observaciones = await db.observaciones.where('bitacoraId').equals(bitacora.id).toArray()
  const respuestas = await db.respuestas.where('bitacoraId').equals(bitacora.id).toArray()

  // Las fotos van primero: si algo después falla, en el reintento las fotos
  // que ya subieron no se vuelven a subir (upload sin upsert + "ya existe"
  // tratado como éxito, igual que con las filas de Postgres).
  const fotoPathPorObservacion = {}
  for (const o of observaciones) {
    if (!o.tieneFoto) continue
    const foto = await db.fotos.get(o.id)
    if (!foto) continue
    fotoPathPorObservacion[o.id] = await subirFoto(bitacora.id, o.id, foto.dataUrl)
  }

  const { error: errorBitacora } = await supabase.from('bitacoras').insert({
    id: bitacora.id,
    ruta_id: bitacora.rutaId,
    recorrido_id: bitacora.recorridoId,
    origen: bitacora.origen,
    idioma: bitacora.idioma,
    nombre_visitante: bitacora.nombreVisitante,
    pais: bitacora.pais,
    correo: bitacora.correo,
    creada_en: bitacora.creadaEn,
    enviada_en: bitacora.enviadaEn,
  })
  if (errorBitacora && errorBitacora.code !== YA_EXISTE) throw errorBitacora

  if (observaciones.length > 0) {
    const { error } = await supabase.from('observaciones').insert(
      observaciones.map((o) => ({
        id: o.id,
        bitacora_id: o.bitacoraId,
        estacion_id: o.estacionId,
        indicador_id: o.indicadorId,
        visto: o.visto,
        cantidad: o.cantidad,
        escala: o.escala,
        foto_path: fotoPathPorObservacion[o.id] ?? null,
      })),
    )
    // Con varias filas a la vez, un solo duplicado hace fallar el lote
    // entero — pero eso solo pasa si esta bitácora ya se había subido
    // completa antes, así que también es un "ya está, no hay problema".
    if (error && error.code !== YA_EXISTE) throw error
  }

  if (respuestas.length > 0) {
    const { error } = await supabase.from('respuestas').insert(
      respuestas.map((r) => ({
        id: r.id,
        bitacora_id: r.bitacoraId,
        pregunta_id: r.preguntaId,
        valor_num: r.valorNum,
        valor_texto: r.valorTexto,
      })),
    )
    if (error && error.code !== YA_EXISTE) throw error
  }
}

async function subirFoto(bitacoraId, observacionId, dataUrl) {
  const blob = dataUrlABlob(dataUrl)
  const ruta = `${bitacoraId}/${observacionId}.jpg`
  const { error } = await supabase.storage.from('fotos').upload(ruta, blob, { contentType: 'image/jpeg', upsert: false })
  if (error && !esDuplicado(error)) throw error
  return ruta
}

function esDuplicado(error) {
  return error?.statusCode === '409' || /already exists|duplicate/i.test(error?.message || '')
}
