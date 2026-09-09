import { db } from './db.js'
import { supabase, supabaseListo } from './supabase.js'

// Código de Postgres para "ya existe una fila con esa llave" (unique_violation).
const YA_EXISTE = '23505'

// Recorre las bitácoras marcadas como "pendiente" en Dexie y las sube a
// Supabase una por una. Si Supabase no está configurado (.env vacío) o el
// celular está sin señal, no hace nada — no es un error, es lo normal.
//
// Usamos un insert liso y llano (no "upsert"), y si Postgres responde
// "ya existe" lo tratamos como éxito, no como falla: significa que un
// intento anterior sí llegó a subirla, y solo nos habíamos quedado sin
// enterarnos (por ejemplo, si la señal se cortó justo después de subir
// pero antes de que la respuesta llegara al celular). Así, llamar esta
// función varias veces —al abrir la app, al volver la señal— es seguro:
// nunca duplica ni se traba con una bitácora que ya subió.
//
// (Al principio probamos "insertar y si ya existe no hacer nada" del lado
// de Postgres con ON CONFLICT DO NOTHING, pero eso exige poder LEER la
// tabla para poder comparar si hay conflicto — y a propósito no le dimos
// permiso de lectura a la app anónima. Por eso mejor todo se decide acá,
// del lado de la app, revisando el código de error.)
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

  const { error: errorBitacora } = await supabase.from('bitacoras').insert({
    id: bitacora.id,
    creada_en: bitacora.creadaEn,
    enviada_en: bitacora.enviadaEn,
    nombre_visitante: bitacora.nombreVisitante,
    pais: bitacora.pais,
    aprendizaje: bitacora.aprendizaje,
    comentario: bitacora.comentario,
  })
  if (errorBitacora && errorBitacora.code !== YA_EXISTE) throw errorBitacora

  if (observaciones.length === 0) return

  const { error: errorObservaciones } = await supabase.from('observaciones').insert(
    observaciones.map((o) => ({
      id: o.id,
      bitacora_id: o.bitacoraId,
      indicador_id: o.indicadorId,
      visto: o.visto,
      cantidad: o.cantidad,
    })),
  )
  // Con varias filas a la vez, un solo duplicado hace fallar el lote entero
  // (Postgres no inserta ninguna de las filas del INSERT si una choca) —
  // pero eso solo pasa si esta bitácora en concreto ya se había subido
  // completa antes, así que también es un "ya está, no hay problema".
  if (errorObservaciones && errorObservaciones.code !== YA_EXISTE) throw errorObservaciones
}
