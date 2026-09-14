import { db } from './db.js'
import { supabase } from './supabase.js'

// Acceso a datos de la app del guía (RF-09 a RF-12). A diferencia del
// visitante, estas funciones SÍ necesitan señal: el guía inicia el
// recorrido y valida con conexión (normalmente la tiene al empezar, en la
// entrada de la finca); mientras camina sin señal, sus propias
// observaciones (RF-12) se guardan con el mismo mecanismo 100% offline del
// visitante — ver bitacoraVisitante.js — porque ya tiene el recorrido_id
// guardado desde que lo inició.
function normalizarRecorrido(r) {
  return {
    id: r.id,
    rutaId: r.ruta_id,
    guiaId: r.guia_id,
    fecha: r.fecha,
    tamanoGrupo: r.tamano_grupo,
    iniciadoEn: r.iniciado_en,
    cerradoEn: r.cerrado_en,
    estado: r.estado,
    notas: r.notas,
  }
}

export async function iniciarRecorrido({ rutaId, tamanoGrupo, notas }, usuarioId) {
  const fila = {
    id: crypto.randomUUID(),
    ruta_id: rutaId,
    guia_id: usuarioId,
    tamano_grupo: tamanoGrupo || null,
    notas: notas || null,
  }
  const { data, error } = await supabase.from('recorridos').insert(fila).select().single()
  if (error) throw error
  const recorrido = normalizarRecorrido(data)
  await db.recorridos.put(recorrido)
  return recorrido
}

export async function misRecorridos(usuarioId) {
  const { data, error } = await supabase
    .from('recorridos').select('*').eq('guia_id', usuarioId).order('iniciado_en', { ascending: false }).limit(30)
  if (error) throw error
  const recorridos = (data ?? []).map(normalizarRecorrido)
  await db.recorridos.bulkPut(recorridos)
  return recorridos
}

export async function obtenerRecorrido(id) {
  const { data, error } = await supabase.from('recorridos').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? normalizarRecorrido(data) : null
}

export async function cerrarRecorrido(id) {
  const { data, error } = await supabase
    .from('recorridos').update({ estado: 'cerrado', cerrado_en: new Date().toISOString() }).eq('id', id).select().single()
  if (error) throw error
  const recorrido = normalizarRecorrido(data)
  await db.recorridos.put(recorrido)
  return recorrido
}

export async function marcarValidado(id) {
  const { error } = await supabase.from('recorridos').update({ estado: 'validado' }).eq('id', id)
  if (error) throw error
}

// RF-10: lo que el grupo marcó, agrupado por estación e indicador — no por
// visitante, porque RF-11 pide validar "cada observación agregada", no una
// por una. Las bitácoras del recorrido son las de su ruta que LLEGARON a
// Supabase entre que el recorrido se inició y (si ya cerró) que se cerró.
//
// Ojo: filtramos por `recibida_en` (la hora del RELOJ DE SUPABASE cuando
// llegó la fila), no por `creada_en` (la hora del CELULAR del visitante).
// Si comparáramos con `creada_en`, un celular con el reloj desajustado —
// pasa más seguido de lo que uno cree — podía quedar fuera de la ventana
// aunque el visitante hiciera el recorrido en el momento correcto. El
// reloj del servidor es el único en el que todos podemos confiar por igual.
export async function resumenRecorrido(recorrido) {
  let consulta = supabase
    .from('bitacoras').select('id, nombre_visitante, pais, correo, origen, creada_en, recibida_en')
    .eq('ruta_id', recorrido.rutaId)
    .gte('recibida_en', recorrido.iniciadoEn)
    .order('creada_en')
  if (recorrido.cerradoEn) consulta = consulta.lte('recibida_en', recorrido.cerradoEn)
  const { data: bitacoras, error: errorBitacoras } = await consulta
  if (errorBitacoras) throw errorBitacoras

  const ids = (bitacoras ?? []).map((b) => b.id)
  if (ids.length === 0) return { bitacoras: [], agregados: [] }

  const { data: observaciones, error: errorObs } = await supabase.from('observaciones').select('*').in('bitacora_id', ids)
  if (errorObs) throw errorObs
  const { data: validaciones, error: errorVal } = await supabase.from('validaciones').select('*').eq('recorrido_id', recorrido.id)
  if (errorVal) throw errorVal

  const grupos = new Map()
  for (const o of observaciones ?? []) {
    const clave = `${o.estacion_id}:${o.indicador_id}`
    if (!grupos.has(clave)) {
      grupos.set(clave, { estacionId: o.estacion_id, indicadorId: o.indicador_id, vistos: 0, total: 0, sumaCantidad: 0, sumaEscala: 0, conEscala: 0, conFoto: 0 })
    }
    const g = grupos.get(clave)
    g.total++
    if (o.visto) {
      g.vistos++
      g.sumaCantidad += o.cantidad || 0
      if (o.escala != null) {
        g.sumaEscala += o.escala
        g.conEscala++
      }
      if (o.foto_path) g.conFoto++
    }
  }

  const agregados = Array.from(grupos.values()).map((g) => ({
    ...g,
    promedioCantidad: g.vistos ? Math.round((g.sumaCantidad / g.vistos) * 10) / 10 : 0,
    promedioEscala: g.conEscala ? Math.round((g.sumaEscala / g.conEscala) * 10) / 10 : null,
    validacion: (validaciones ?? []).find((v) => v.estacion_id === g.estacionId && v.indicador_id === g.indicadorId) ?? null,
  }))

  return { bitacoras: bitacoras ?? [], agregados }
}

// RF-11: confirmar, ajustar o descartar una observación agregada.
export async function validarObservacion(recorridoId, estacionId, indicadorId, { decision, valorFinal, nota }, usuarioId) {
  const { error } = await supabase.from('validaciones').upsert(
    {
      recorrido_id: recorridoId,
      estacion_id: estacionId,
      indicador_id: indicadorId,
      decision,
      valor_final: valorFinal ?? null,
      nota: nota ?? null,
      validado_por: usuarioId,
      validado_en: new Date().toISOString(),
    },
    { onConflict: 'recorrido_id,estacion_id,indicador_id' },
  )
  if (error) throw error
}
