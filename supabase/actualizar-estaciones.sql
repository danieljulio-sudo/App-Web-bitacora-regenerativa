-- ============================================================================
-- Bitácora Regenerativa · Reestructurar la ruta de ejemplo a 4 estaciones
-- ============================================================================
-- Reemplaza las 3 estaciones de ejemplo (Entrada del bosque, Zona de cacao,
-- Quebrada) por las 4 que describiste: un caminito antes del sendero
-- principal, el sendero del bosque, la zona de cacao y el área de la casa.
--
-- Corre esto UNA vez en el SQL Editor, después de schema.sql + semilla.sql.
-- Se puede volver a correr sin problema (borra y vuelve a armar solo las
-- estaciones de "Ruta del Cacao", no toca nada más).
-- ============================================================================

-- 1) Vaciar las estaciones viejas de esta ruta (y sus vínculos con indicadores).
delete from estacion_indicadores where estacion_id in (
  select id from estaciones where ruta_id = '11111111-1111-1111-1111-111111111111'
);
delete from estaciones where ruta_id = '11111111-1111-1111-1111-111111111111';

-- 2) Las 4 estaciones nuevas, en el orden en que se caminan.
insert into estaciones (id, ruta_id, orden, nombre_es, nombre_en, descripcion_es, descripcion_en) values
  ('22222222-2222-2222-2222-222222222211', '11111111-1111-1111-1111-111111111111', 1,
   'Caminito de entrada', 'Entry path',
   'El caminito corto antes de tomar el sendero principal — aquí también hay señales que vale la pena mirar.',
   'The short path before the main trail — there are signs worth looking for here too.'),
  ('22222222-2222-2222-2222-222222222212', '11111111-1111-1111-1111-111111111111', 2,
   'Sendero del bosque', 'Forest trail',
   'El sendero que atraviesa el bosque, antes de llegar al cultivo.',
   'The trail that crosses the forest, before reaching the crop.'),
  ('22222222-2222-2222-2222-222222222213', '11111111-1111-1111-1111-111111111111', 3,
   'Zona de cacao', 'Cacao area',
   'Los árboles de cacao bajo sombra, en plena producción.',
   'The shade-grown cacao trees, in full production.'),
  ('22222222-2222-2222-2222-222222222214', '11111111-1111-1111-1111-111111111111', 4,
   'Área de la casa', 'House area',
   'Alrededor de la casa de la finca: huerta, compostaje y vida cotidiana.',
   'Around the farmhouse: garden, composting and everyday life.')
on conflict (id) do update set nombre_es = excluded.nombre_es, nombre_en = excluded.nombre_en,
  descripcion_es = excluded.descripcion_es, descripcion_en = excluded.descripcion_en, orden = excluded.orden;

-- 3) Un indicador nuevo para el área de la casa (las otras 6 ya existían).
insert into indicadores (id, nombre_es, nombre_en, pista_es, pista_en, explicacion_es, explicacion_en, categoria, tipo_medicion, emoji, pide_foto, orden) values
  ('33333333-3333-3333-3333-333333333307', 'Compostaje casero', 'Home composting',
   'Cerca de la cocina o el huerto', 'Near the kitchen or the garden',
   'Compostar los residuos de comida cierra el ciclo: lo que sale de la tierra vuelve a ella en vez de convertirse en basura.',
   'Composting food scraps closes the loop: what comes from the soil goes back to it instead of becoming trash.',
   'suelo', 'si_no', '🌱', true, 7)
on conflict (id) do nothing;

-- 4) Repartir los indicadores en sus estaciones.
insert into estacion_indicadores (estacion_id, indicador_id, orden) values
  ('22222222-2222-2222-2222-222222222211', '33333333-3333-3333-3333-333333333301', 1), -- diente de león
  ('22222222-2222-2222-2222-222222222211', '33333333-3333-3333-3333-333333333302', 2), -- suelo cubierto
  ('22222222-2222-2222-2222-222222222212', '33333333-3333-3333-3333-333333333305', 1), -- lombrices
  ('22222222-2222-2222-2222-222222222212', '33333333-3333-3333-3333-333333333304', 2), -- sombra del dosel
  ('22222222-2222-2222-2222-222222222213', '33333333-3333-3333-3333-333333333303', 1), -- abejas
  ('22222222-2222-2222-2222-222222222213', '33333333-3333-3333-3333-333333333306', 2), -- agua de la quebrada
  ('22222222-2222-2222-2222-222222222214', '33333333-3333-3333-3333-333333333307', 1)  -- compostaje casero
on conflict (estacion_id, indicador_id) do nothing;
