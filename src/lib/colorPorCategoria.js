// Cada categoría de indicador tiene su propio tono — no es solo decoración:
// ayuda al visitante a agrupar mentalmente qué tipo de señal está buscando
// (suelo, agua, biodiversidad, planta) según el color del círculo, igual
// que categorías de colores en un mapa. Si el indicador no trae categoría,
// se queda con el verde por defecto.
const MAPA = {
  suelo: 'var(--cacao-soft)',
  agua: 'var(--sky)',
  biodiversidad: 'var(--pollen-soft)',
  planta: 'var(--leaf-soft)',
}

export function colorPorCategoria(categoria) {
  return MAPA[categoria] || 'var(--leaf-soft)'
}

// Para las estaciones (que mezclan varias categorías) rotamos entre los
// mismos tonos por orden, así la lista de estaciones también se ve variada
// en vez de un solo verde repetido cuatro veces.
const ROTACION = ['var(--leaf-soft)', 'var(--pollen-soft)', 'var(--sky)', 'var(--cacao-soft)']

export function colorPorIndice(indice) {
  return ROTACION[indice % ROTACION.length]
}
