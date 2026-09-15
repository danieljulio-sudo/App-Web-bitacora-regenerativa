import { db } from './db.js'
import { supabase, supabaseListo } from './supabase.js'

// Todo lo que necesita la app del visitante para pintar una ruta: sus
// estaciones, los indicadores de cada una y las preguntas de cierre. Se
// llama al entrar a /r/:codigo (ver pages/visitante/Visitante.jsx).
//
// Con señal: baja la versión más fresca de Supabase y la guarda en Dexie.
// Sin señal (o si la bajada falla): usa lo último que quedó guardado de una
// visita anterior a esa misma ruta en este celular. Si nunca se visitó esa
// ruta con señal, no hay nada que mostrar — de ahí que RF-01 (escanear el
// QR) suponga que el primer visitante del día sí tiene señal al entrar.
//
// El nombre de la ruta (`ruta.nombre`) no se traduce a propósito: es un
// nombre propio ("Ruta del Cacao"), igual que el de la finca. Lo que sí es
// bilingüe (RNF-05) es el contenido que el visitante lee para entender cada
// señal: estaciones e indicadores traen "_es"/"_en".
export async function cargarRuta(codigo) {
  if (supabaseListo && navigator.onLine) {
    try {
      const fresca = await bajarDeSupabase({ codigo })
      if (fresca) {
        await guardarEnCache(fresca)
        return fresca
      }
    } catch (error) {
      console.warn('No se pudo bajar la ruta de Supabase, se usa la copia local si existe', error)
    }
  }
  return leerDeCache(codigo)
}

// Usado por la app del guía (RF-10, RF-12): el recorrido guarda el id de la
// ruta, no su código de QR, así que necesita esta variante. Misma idea que
// `cargarRuta`, cayendo también a la copia local si no hay señal.
export async function cargarRutaPorId(rutaId) {
  if (supabaseListo && navigator.onLine) {
    try {
      const fresca = await bajarDeSupabase({ id: rutaId })
      if (fresca) {
        await guardarEnCache(fresca)
        return fresca
      }
    } catch (error) {
      console.warn('No se pudo bajar la ruta de Supabase, se usa la copia local si existe', error)
    }
  }
  const ruta = await db.rutas.get(rutaId)
  return ruta ? leerDeCache(ruta.codigo) : null
}

async function bajarDeSupabase(filtro) {
  let consulta = supabase.from('rutas').select('*').eq('activa', true)
  consulta = filtro.codigo ? consulta.eq('codigo', filtro.codigo) : consulta.eq('id', filtro.id)
  const { data: ruta, error: errorRuta } = await consulta.maybeSingle()
  if (errorRuta) throw errorRuta
  if (!ruta) return null

  const { data: estaciones, error: errorEstaciones } = await supabase
    .from('estaciones')
    .select('*, estacion_indicadores(orden, indicadores(*))')
    .eq('ruta_id', ruta.id).eq('activa', true).order('orden')
  if (errorEstaciones) throw errorEstaciones

  const { data: preguntas, error: errorPreguntas } = await supabase
    .from('preguntas').select('*').eq('activa', true).order('orden')
  if (errorPreguntas) throw errorPreguntas

  return normalizar(ruta, estaciones ?? [], preguntas ?? [])
}

function normalizar(ruta, estacionesCrudas, preguntasCrudas) {
  const estaciones = estacionesCrudas
    .map((e) => ({
      id: e.id,
      rutaId: e.ruta_id,
      orden: e.orden,
      nombre_es: e.nombre_es,
      nombre_en: e.nombre_en,
      descripcion_es: e.descripcion_es,
      descripcion_en: e.descripcion_en,
      fotoPath: e.foto_path,
      indicadores: (e.estacion_indicadores ?? [])
        .slice()
        .sort((a, b) => a.orden - b.orden)
        .map((vinculo) => normalizarIndicador(vinculo.indicadores))
        .filter(Boolean),
    }))
    .sort((a, b) => a.orden - b.orden)

  return {
    ruta: { id: ruta.id, codigo: ruta.codigo, nombre: ruta.nombre, descripcion: ruta.descripcion },
    estaciones,
    preguntas: preguntasCrudas.map(normalizarPregunta).sort((a, b) => a.orden - b.orden),
  }
}

function normalizarIndicador(i) {
  if (!i) return null
  return {
    id: i.id,
    orden: i.orden,
    categoria: i.categoria,
    tipoMedicion: i.tipo_medicion, // conteo | si_no | escala | foto
    emoji: i.emoji,
    fotoPath: i.foto_path,
    pideFoto: i.pide_foto,
    nombreCientifico: i.nombre_cientifico,
    nombre_es: i.nombre_es,
    nombre_en: i.nombre_en,
    pista_es: i.pista_es,
    pista_en: i.pista_en,
    explicacion_es: i.explicacion_es,
    explicacion_en: i.explicacion_en,
  }
}

function normalizarPregunta(p) {
  return {
    id: p.id,
    orden: p.orden,
    tipo: p.tipo, // escala | texto
    texto_es: p.texto_es,
    texto_en: p.texto_en,
    minimo_es: p.minimo_es,
    minimo_en: p.minimo_en,
    maximo_es: p.maximo_es,
    maximo_en: p.maximo_en,
  }
}

async function guardarEnCache(bundle) {
  const estacionIds = bundle.estaciones.map((e) => e.id)
  await db.transaction('rw', db.rutas, db.estaciones, db.estacionIndicadores, db.indicadores, db.preguntas, async () => {
    await db.rutas.put(bundle.ruta)
    await db.estaciones.where('rutaId').equals(bundle.ruta.id).delete()
    if (estacionIds.length) await db.estacionIndicadores.where('estacionId').anyOf(estacionIds).delete()
    for (const estacion of bundle.estaciones) {
      const { indicadores, ...datosEstacion } = estacion
      await db.estaciones.put(datosEstacion)
      let orden = 0
      for (const indicador of indicadores) {
        await db.indicadores.put(indicador)
        await db.estacionIndicadores.put({ estacionId: estacion.id, indicadorId: indicador.id, orden: orden++ })
      }
    }
    await db.preguntas.bulkPut(bundle.preguntas)
  })
}

async function leerDeCache(codigo) {
  const ruta = await db.rutas.where('codigo').equals(codigo).first()
  if (!ruta) return null

  const estacionesFilas = await db.estaciones.where('rutaId').equals(ruta.id).sortBy('orden')
  const estaciones = await Promise.all(
    estacionesFilas.map(async (estacion) => {
      const vinculos = await db.estacionIndicadores.where('estacionId').equals(estacion.id).sortBy('orden')
      const indicadores = await Promise.all(vinculos.map((v) => db.indicadores.get(v.indicadorId)))
      return { ...estacion, indicadores: indicadores.filter(Boolean) }
    }),
  )

  const preguntas = (await db.preguntas.toArray()).sort((a, b) => a.orden - b.orden)
  return { ruta, estaciones, preguntas }
}

// Usado por la app del guía para elegir ruta al iniciar un recorrido
// (RF-09). A diferencia de `cargarRuta`, esto sí necesita señal — el guía
// lo hace normalmente antes de entrar al bosque.
export async function listarRutasActivas() {
  if (!supabaseListo) return []
  const { data, error } = await supabase.from('rutas').select('id, nombre, codigo').eq('activa', true).order('nombre')
  if (error) throw error
  return data ?? []
}
