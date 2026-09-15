# Plan Fase 1 · entrega miércoles

Objetivo: app funcional con las tres entradas (visitante, guía, panel) según
RF-01 a RF-06, RF-09 a RF-17 y RF-20 de la propuesta v0.1. Datos de ejemplo
mientras llega el catálogo real; el panel permite cargar los indicadores y
fotos reales sin tocar código.

## Estado del código (14 sep)
- Visitante: flujo completo sin señal (Dexie) y subida a Supabase. Falta:
  QR por ruta, estaciones, escala, preguntas configurables, ES/EN, correo,
  subida de fotos.
- Guía y Panel: pantallas vacías.
- `supabase/schema.sql` ya está reescrito para Fase 1 (ver abajo). Falta
  validarlo en Supabase y escribir `supabase/semilla.sql`.
- Dependencias ya agregadas: `qrcode` (QR) y `xlsx` (Excel).

## Decisiones de arquitectura
- **Roles** con Supabase Auth (correo + contraseña). La primera persona que
  se registra en el proyecto queda como admin. Después, el admin invita por
  correo desde el panel (tabla `invitaciones`); al registrarse con ese correo
  el trigger `al_crear_usuario` le asigna el rol. Sin invitación → perfil
  inactivo. Desactivar = `perfiles.activo = false`.
- **QR por ruta**: `/r/<codigo>`. La app baja la ruta (estaciones,
  indicadores, preguntas) de Supabase cuando hay señal y la guarda en Dexie
  (`rutasCache` por código) para funcionar sin señal.
- **Vínculo visitante ↔ recorrido**: el visitante no escribe ningún código.
  La bitácora guarda `ruta_id` y `creada_en`; el guía ve las bitácoras de su
  ruta dentro de la ventana `iniciado_en`..`cerrado_en` del recorrido.
  Opcional: el guía puede mostrar un QR con `?rec=<id>` y entonces la
  bitácora guarda `recorrido_id`.
- **Observaciones del guía (RF-12)**: son una bitácora con `origen='guia'`.
  Reusa todo el pipeline offline del visitante.
- **Fotos**: bucket `fotos` (anon solo inserta, lectura pública). Ruta
  determinista `<bitacoraId>/<estacionId>_<indicadorId>.jpg`, se sube ANTES
  de insertar las filas y el 409 "ya existe" cuenta como éxito. Fotos de
  catálogo en bucket `catalogo` (solo admin).
- **Sin update para anon**: los reintentos siguen resolviéndose con 23505 =
  éxito, como hasta ahora.
- **i18n**: diccionario `src/i18n/textos.js` (es/en) + contexto; el catálogo
  trae campos `_es`/`_en`. Guía y panel solo en español (RNF-05).
- **Excel (RF-17)**: `xlsx` en el navegador, hojas Observaciones validadas,
  Bitácoras, Respuestas.

## Estructura de carpetas propuesta
```
src/
  i18n/textos.js, IdiomaContext.jsx
  lib/db.js (Dexie v2: rutasCache, bitacoras, observaciones, respuestas, fotos)
      catalogo.js (cargarRuta(codigo) online→cache), bitacoraVisitante.js,
      sincronizar.js (fotos→bitacora→observaciones→respuestas), foto.js,
      supabase.js, sesion.js (useSesion, RequiereRol), exportar.js
  pages/Inicio.jsx
  pages/visitante/ Visitante.jsx (/r/:codigo y /visitante), Bienvenida,
      Estaciones, Estacion, Indicador, Cierre, Gracias
  pages/guia/ Login, Recorridos, Recorrido (resumen por estación/indicador,
      validar, observación propia, cerrar)
  pages/admin/ Panel (tabs): Indicadores, Rutas (estaciones + asignación +
      QR imprimible), Recorridos (detalle + exportar), Usuarios
  components/ Layout (variante ancha para admin), EstadoConexion, Sincronizador
```

## Orden de trabajo
1. Validar `schema.sql` en Supabase y escribir `semilla.sql` (1 ruta, 3
   estaciones, 6 indicadores, 3 preguntas).
2. Capa de datos + i18n + sesión.
3. Visitante (RF-01..07).
4. Guía (RF-09..12).
5. Panel (RF-13..17, RF-20).
6. Prueba de punta a punta en celular, README de producción, deploy.

## Pendiente del cliente
- Catálogo real (nombre ES/EN, foto, explicación, categoría, tipo).
- Estaciones de la primera ruta y las 3–4 preguntas de cierre.
- Cuentas de Supabase y GitHub a nombre de la finca (RNF-07).
