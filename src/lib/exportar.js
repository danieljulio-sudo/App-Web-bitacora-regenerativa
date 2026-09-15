import { supabase } from './supabase.js'

// El nombre, país, correo y las respuestas de texto libre los escribe
// cualquier visitante sin cuenta (RLS de bitacoras/respuestas es "inserta
// lo que sea"). Si alguien pone algo como '=HYPERLINK("http://mal.io")'
// como nombre, y luego el guía abre el Excel exportado, algunos programas
// de hojas de cálculo lo ejecutan como fórmula en vez de mostrarlo como
// texto (inyección de fórmulas / CWE-1236) — sobre todo si el archivo se
// vuelve a abrir como CSV. Anteponer una comilla simple fuerza a texto.
function celdaSegura(valor) {
  if (typeof valor !== 'string') return valor
  return /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor
}

// RF-17: exportar observaciones validadas a Excel. Trabaja sobre un
// recorrido ya cerrado — junta bitácoras, observaciones y respuestas, y las
// vuelve tres hojas de un mismo archivo.
//
// `xlsx` pesa bastante y solo lo usan guía/admin, nunca el visitante — se
// importa aquí adentro (import dinámico) para que Vite lo separe en su
// propio archivo y no infle la primera carga del visitante (RNF-03: cargar
// en menos de 2 segundos con señal débil).
export async function exportarRecorridoExcel(recorrido, ruta) {
  const XLSX = await import('xlsx')
  // Mismo criterio que resumenRecorrido: por reloj del servidor
  // (`recibida_en`), no del celular (`creada_en`) — ver el comentario en
  // lib/recorridoGuia.js.
  const { data: bitacoras, error: e1 } = await supabase
    .from('bitacoras').select('*').eq('ruta_id', recorrido.rutaId).gte('recibida_en', recorrido.iniciadoEn)
    .lte('recibida_en', recorrido.cerradoEn ?? new Date().toISOString())
  if (e1) throw e1
  const ids = (bitacoras ?? []).map((b) => b.id)

  const [{ data: observaciones, error: e2 }, { data: respuestas, error: e3 }, { data: indicadores }, { data: estaciones }, { data: preguntas }] = await Promise.all([
    ids.length ? supabase.from('observaciones').select('*').in('bitacora_id', ids) : { data: [] },
    ids.length ? supabase.from('respuestas').select('*').in('bitacora_id', ids) : { data: [] },
    supabase.from('indicadores').select('id, nombre_es'),
    supabase.from('estaciones').select('id, nombre_es'),
    supabase.from('preguntas').select('id, texto_es'),
  ])
  if (e2) throw e2
  if (e3) throw e3

  const nombreIndicador = Object.fromEntries((indicadores ?? []).map((i) => [i.id, i.nombre_es]))
  const nombreEstacion = Object.fromEntries((estaciones ?? []).map((e) => [e.id, e.nombre_es]))
  const textoPregunta = Object.fromEntries((preguntas ?? []).map((p) => [p.id, p.texto_es]))
  const nombreVisitantePorBitacora = Object.fromEntries((bitacoras ?? []).map((b) => [b.id, celdaSegura(b.nombre_visitante)]))

  const hojaBitacoras = (bitacoras ?? []).map((b) => ({
    Visitante: celdaSegura(b.nombre_visitante),
    País: celdaSegura(b.pais ?? ''),
    Correo: celdaSegura(b.correo ?? ''),
    Origen: b.origen,
    'Fecha de inicio': b.creada_en,
    'Fecha de envío': b.enviada_en,
  }))

  const hojaObservaciones = (observaciones ?? []).map((o) => ({
    Visitante: nombreVisitantePorBitacora[o.bitacora_id] ?? '',
    Estación: nombreEstacion[o.estacion_id] ?? '',
    Indicador: nombreIndicador[o.indicador_id] ?? '',
    Visto: o.visto ? 'Sí' : 'No',
    Cantidad: o.cantidad,
    Escala: o.escala ?? '',
    Foto: o.foto_path ? 'Sí' : 'No',
  }))

  const hojaRespuestas = (respuestas ?? []).map((r) => ({
    Visitante: nombreVisitantePorBitacora[r.bitacora_id] ?? '',
    Pregunta: textoPregunta[r.pregunta_id] ?? '',
    'Valor (escala)': r.valor_num ?? '',
    'Valor (texto)': celdaSegura(r.valor_texto ?? ''),
  }))

  const libro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(hojaBitacoras), 'Bitácoras')
  XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(hojaObservaciones), 'Observaciones')
  XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(hojaRespuestas), 'Respuestas')

  const fecha = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(libro, `${ruta?.nombre ?? 'recorrido'} - ${fecha}.xlsx`)
}
