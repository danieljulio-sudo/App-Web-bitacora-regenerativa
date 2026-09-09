import Dexie from 'dexie'

// IndexedDB es una base de datos que vive dentro del navegador del celular.
// Dexie es la librería que la hace fácil de usar. Aquí definimos las "tablas" locales.
// El texto de cada tabla dice por qué campos se puede buscar rápido (índices).
export const db = new Dexie('bitacora-regenerativa')

db.version(1).stores({
  catalogo: 'id, tipo',                       // copia local de indicadores, rutas y estaciones
  bitacoras: 'id, estado, creadaEn',          // estado: borrador | pendiente | sincronizada
  observaciones: 'id, bitacoraId, indicadorId',
  fotos: 'id, observacionId',                 // la imagen comprimida, hasta que sube a Supabase
})
