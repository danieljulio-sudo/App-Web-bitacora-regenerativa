import { db } from './db.js'

// Semilla del catálogo: mientras no existe el panel Admin (Paso 7) para crear
// indicadores desde Supabase, dejamos estos 4 escritos aquí. Son los mismos
// del prototipo en public/demo. El día que Admin exista, esta función se
// puede cambiar para traerlos de la nube en vez de tenerlos fijos — el resto
// de la app (Visitante, Guía) no tiene que cambiar, porque siempre lee de
// la tabla local `catalogo`.
const INDICADORES_SEMILLA = [
  {
    id: 'diente',
    tipo: 'indicador',
    orden: 1,
    nombre: 'Diente de león',
    nombreCientifico: 'Taraxacum officinale',
    emoji: '🌼',
    pista: 'Flor amarilla o cabeza blanca de semillas',
    porque: 'Sus raíces profundas rompen el suelo compactado y suben minerales a la superficie. Donde aparece, el suelo se está soltando.',
    clase: 'conteo', // 'conteo' = ¿cuántos viste? · 'si_no' = solo sí/no
    pideFoto: true,
  },
  {
    id: 'suelo',
    tipo: 'indicador',
    orden: 2,
    nombre: 'Suelo cubierto de hojarasca',
    nombreCientifico: '',
    emoji: '🍂',
    pista: 'Mira el piso bajo los árboles de cacao',
    porque: 'Un suelo tapado guarda humedad, alimenta hongos y no se lava con la lluvia. Suelo desnudo es suelo que se está perdiendo.',
    clase: 'si_no',
    pideFoto: true,
  },
  {
    id: 'abeja',
    tipo: 'indicador',
    orden: 3,
    nombre: 'Abejas y polinizadores',
    nombreCientifico: '',
    emoji: '🐝',
    pista: 'En flores, cerca de la quebrada',
    porque: 'Sin polinizadores no hay cacao. Verlos trabajando significa que aquí no se usan venenos.',
    clase: 'conteo',
    pideFoto: true,
  },
  {
    id: 'lombriz',
    tipo: 'indicador',
    orden: 4,
    nombre: 'Lombrices de tierra',
    nombreCientifico: '',
    emoji: '🪱',
    pista: 'Levanta un poco de hojarasca húmeda',
    porque: 'Son fábricas de suelo vivo. Donde hay lombrices hay materia orgánica, aire y agua en la tierra.',
    clase: 'si_no',
    pideFoto: true,
  },
]

// Se llama una vez al arrancar la app (ver main.jsx). Si la tabla local ya
// tiene datos no hace nada — así no borra un catálogo real el día que venga
// de Supabase.
export async function sembrarCatalogoSiVacio() {
  const hay = await db.catalogo.count()
  if (hay > 0) return
  await db.catalogo.bulkAdd(INDICADORES_SEMILLA)
}

// Lista de indicadores ordenada, lista para pintar en pantalla.
export async function listarIndicadores() {
  const filas = await db.catalogo.where('tipo').equals('indicador').toArray()
  return filas.sort((a, b) => a.orden - b.orden)
}

export const PAISES = [
  'Colombia', 'Estados Unidos', 'México', 'España', 'Alemania', 'Francia',
  'Reino Unido', 'Canadá', 'Países Bajos', 'Suiza', 'Brasil', 'Argentina',
  'Chile', 'Perú', 'Ecuador', 'Otro',
]
