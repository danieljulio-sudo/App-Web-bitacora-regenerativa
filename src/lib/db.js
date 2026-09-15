import Dexie from 'dexie'

// IndexedDB es una base de datos que vive dentro del navegador del celular.
// Dexie es la librería que la hace fácil de usar. Aquí definimos las "tablas"
// locales. El texto de cada tabla dice por qué campos se puede buscar rápido
// (índices).
export const db = new Dexie('bitacora-regenerativa')

// v1 (Paso 5) tenía una sola tabla `catalogo` con 4 indicadores fijos.
// En v2 el catálogo viene de Supabase por ruta (ver lib/ruta.js) y se
// guarda en 4 tablas — rutas, estaciones, indicadores, preguntas — para que
// el recorrido funcione sin señal después de la primera visita a /r/:codigo.
// Como `catalogo` no se lista aquí, Dexie la borra sola al migrar.
db.version(2).stores({
  // --- catálogo, en caché por ruta (de solo lectura para la app) ---
  rutas: 'id, codigo',
  estaciones: 'id, rutaId',
  estacionIndicadores: '[estacionId+indicadorId], estacionId, indicadorId',
  indicadores: 'id',
  preguntas: 'id',

  // --- lo que crea este celular, en cola para subir a Supabase ---
  // estado de bitacoras/recorridos: borrador|abierto → pendiente → sincronizada
  recorridos: 'id, estado, rutaId',
  bitacoras: 'id, estado, creadaEn, rutaId, recorridoId',
  observaciones: 'id, bitacoraId, estacionId, indicadorId',
  respuestas: 'id, bitacoraId, preguntaId',
  fotos: 'id, observacionId', // la imagen comprimida, hasta que sube a Storage
})
