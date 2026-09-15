import { supabase } from './supabase.js'
import { dataUrlABlob } from './foto.js'

// Todo lo que hace el panel de la finca contra Supabase: indicadores, rutas
// y estaciones, preguntas de cierre, recorridos y usuarios (RF-13 a RF-17,
// RF-20). Siempre requiere sesión de admin — las reglas RLS del lado del
// servidor son las que de verdad lo hacen cumplir; esto es solo la capa de
// acceso a datos para que las pantallas no llamen a `supabase` directo.

// --- Indicadores (RF-13) --------------------------------------------------
export async function listarIndicadores() {
  const { data, error } = await supabase.from('indicadores').select('*').order('orden')
  if (error) throw error
  return data ?? []
}

export async function guardarIndicador(datos) {
  const fila = {
    nombre_es: datos.nombre_es,
    nombre_en: datos.nombre_en || null,
    nombre_cientifico: datos.nombreCientifico || null,
    pista_es: datos.pista_es || null,
    pista_en: datos.pista_en || null,
    explicacion_es: datos.explicacion_es || null,
    explicacion_en: datos.explicacion_en || null,
    categoria: datos.categoria || null,
    tipo_medicion: datos.tipoMedicion,
    emoji: datos.emoji || null,
    pide_foto: Boolean(datos.pideFoto),
    orden: datos.orden ?? 0,
  }
  if (datos.id) {
    const { error } = await supabase.from('indicadores').update(fila).eq('id', datos.id)
    if (error) throw error
    return datos.id
  }
  const { data, error } = await supabase.from('indicadores').insert(fila).select('id').single()
  if (error) throw error
  return data.id
}

export async function desactivarIndicador(id, activo) {
  const { error } = await supabase.from('indicadores').update({ activo }).eq('id', id)
  if (error) throw error
}

export async function subirFotoIndicador(id, dataUrl) {
  const ruta = `indicadores/${id}.jpg`
  const { error } = await supabase.storage.from('catalogo').upload(ruta, dataUrlABlob(dataUrl), { contentType: 'image/jpeg', upsert: true })
  if (error) throw error
  await supabase.from('indicadores').update({ foto_path: ruta }).eq('id', id)
  return ruta
}

// --- Rutas y estaciones (RF-14, RF-15) ------------------------------------
export async function listarRutas() {
  const { data, error } = await supabase.from('rutas').select('*').order('creada_en')
  if (error) throw error
  return data ?? []
}

export async function crearRuta({ nombre, codigo, descripcion }) {
  const { data, error } = await supabase.from('rutas').insert({ nombre, codigo, descripcion: descripcion || null }).select('id').single()
  if (error) throw error
  return data.id
}

export async function actualizarRuta(id, { nombre, codigo, descripcion, activa }) {
  const { error } = await supabase.from('rutas').update({ nombre, codigo, descripcion, activa }).eq('id', id)
  if (error) throw error
}

export async function listarEstaciones(rutaId) {
  const { data, error } = await supabase.from('estaciones').select('*, estacion_indicadores(indicador_id, orden)').eq('ruta_id', rutaId).order('orden')
  if (error) throw error
  return data ?? []
}

export async function guardarEstacion(rutaId, datos) {
  const fila = {
    ruta_id: rutaId,
    orden: datos.orden ?? 0,
    nombre_es: datos.nombre_es,
    nombre_en: datos.nombre_en || null,
    descripcion_es: datos.descripcion_es || null,
    descripcion_en: datos.descripcion_en || null,
  }
  if (datos.id) {
    const { error } = await supabase.from('estaciones').update(fila).eq('id', datos.id)
    if (error) throw error
    return datos.id
  }
  const { data, error } = await supabase.from('estaciones').insert(fila).select('id').single()
  if (error) throw error
  return data.id
}

export async function eliminarEstacion(id) {
  const { error } = await supabase.from('estaciones').delete().eq('id', id)
  if (error) throw error
}

export async function asignarIndicador(estacionId, indicadorId, orden = 0) {
  const { error } = await supabase.from('estacion_indicadores').upsert({ estacion_id: estacionId, indicador_id: indicadorId, orden }, { onConflict: 'estacion_id,indicador_id' })
  if (error) throw error
}

export async function quitarIndicador(estacionId, indicadorId) {
  const { error } = await supabase.from('estacion_indicadores').delete().eq('estacion_id', estacionId).eq('indicador_id', indicadorId)
  if (error) throw error
}

// --- Preguntas de cierre (RF-06 configurable desde el panel) -------------
export async function listarPreguntas() {
  const { data, error } = await supabase.from('preguntas').select('*').order('orden')
  if (error) throw error
  return data ?? []
}

export async function guardarPregunta(datos) {
  const fila = {
    orden: datos.orden ?? 0,
    texto_es: datos.texto_es,
    texto_en: datos.texto_en || null,
    tipo: datos.tipo,
    minimo_es: datos.minimo_es || null,
    minimo_en: datos.minimo_en || null,
    maximo_es: datos.maximo_es || null,
    maximo_en: datos.maximo_en || null,
  }
  if (datos.id) {
    const { error } = await supabase.from('preguntas').update(fila).eq('id', datos.id)
    if (error) throw error
    return datos.id
  }
  const { data, error } = await supabase.from('preguntas').insert(fila).select('id').single()
  if (error) throw error
  return data.id
}

export async function desactivarPregunta(id, activa) {
  const { error } = await supabase.from('preguntas').update({ activa }).eq('id', id)
  if (error) throw error
}

// --- Recorridos (RF-16) ---------------------------------------------------
export async function listarRecorridos() {
  const { data, error } = await supabase
    .from('recorridos').select('*, rutas(nombre)').order('iniciado_en', { ascending: false }).limit(100)
  if (error) throw error
  return data ?? []
}

// --- Usuarios (RF-20) ------------------------------------------------------
export async function listarPerfiles() {
  const { data, error } = await supabase.from('perfiles').select('*').order('creado_en')
  if (error) throw error
  return data ?? []
}

export async function listarInvitaciones() {
  const { data, error } = await supabase.from('invitaciones').select('*').order('creada_en')
  if (error) throw error
  return data ?? []
}

// Invitar es solo dejar la intención guardada: la cuenta la crea la propia
// persona registrándose con ese correo (ver trigger `manejar_nuevo_usuario`
// en supabase/schema.sql), no hay envío de correo automático todavía — hay
// que avisarle por fuera que ya puede crear su cuenta.
export async function invitar({ correo, rol, nombre }) {
  const { error } = await supabase.from('invitaciones').upsert({ correo: correo.toLowerCase().trim(), rol, nombre: nombre || null })
  if (error) throw error
}

export async function cambiarRol(perfilId, rol) {
  const { error } = await supabase.from('perfiles').update({ rol }).eq('id', perfilId)
  if (error) throw error
}

export async function cambiarActivo(perfilId, activo) {
  const { error } = await supabase.from('perfiles').update({ activo }).eq('id', perfilId)
  if (error) throw error
}
