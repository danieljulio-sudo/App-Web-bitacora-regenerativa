-- ============================================================================
-- Bitácora Regenerativa · Datos de ejemplo para probar Fase 1
-- ============================================================================
-- Correr DESPUÉS de supabase/schema.sql. Es la ruta de prueba: 1 ruta, 3
-- estaciones, 6 indicadores (uno de cada tipo de medición) y 3 preguntas de
-- cierre. El código QR de esta ruta es "ruta-cacao" → /r/ruta-cacao.
--
-- Se puede correr de nuevo sin duplicar nada ("on conflict do nothing" por id).
-- Cuando llegue el catálogo real de la finca, esto se reemplaza desde el
-- panel (Indicadores → Rutas), no hace falta tocar SQL otra vez.
-- ============================================================================

insert into rutas (id, nombre, codigo, descripcion, activa) values
  ('11111111-1111-1111-1111-111111111111', 'Ruta del Cacao', 'ruta-cacao',
   'Recorrido de ejemplo por la finca: bosque, cultivo de cacao y quebrada.', true)
on conflict (id) do nothing;

insert into estaciones (id, ruta_id, orden, nombre_es, nombre_en, descripcion_es, descripcion_en) values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111111', 1,
   'Entrada del bosque', 'Forest entrance',
   'El punto donde el sendero deja el cultivo y entra al bosque.', 'Where the trail leaves the crop and enters the forest.'),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111111', 2,
   'Zona de cacao', 'Cacao area',
   'Los árboles de cacao bajo sombra, en plena producción.', 'The shade-grown cacao trees, in full production.'),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111111', 3,
   'Quebrada', 'Creek',
   'El agua que riega la finca y de la que depende todo lo demás.', 'The water that feeds the farm and everything else depends on.')
on conflict (id) do nothing;

insert into indicadores (id, nombre_es, nombre_en, nombre_cientifico, pista_es, pista_en, explicacion_es, explicacion_en, categoria, tipo_medicion, emoji, pide_foto, orden) values
  ('33333333-3333-3333-3333-333333333301', 'Diente de león', 'Dandelion', 'Taraxacum officinale',
   'Flor amarilla o cabeza blanca de semillas', 'Yellow flower or white seed head',
   'Sus raíces profundas rompen el suelo compactado y suben minerales a la superficie. Donde aparece, el suelo se está soltando.',
   'Its deep roots break up compacted soil and bring minerals to the surface. Where it grows, the soil is loosening.',
   'planta', 'conteo', '🌼', true, 1),
  ('33333333-3333-3333-3333-333333333302', 'Suelo cubierto de hojarasca', 'Leaf-covered soil', '',
   'Mira el piso bajo los árboles', 'Look at the ground under the trees',
   'Un suelo tapado guarda humedad, alimenta hongos y no se lava con la lluvia. Suelo desnudo es suelo que se está perdiendo.',
   'Covered soil holds moisture, feeds fungi and does not wash away with rain. Bare soil is soil being lost.',
   'suelo', 'si_no', '🍂', true, 2),
  ('33333333-3333-3333-3333-333333333303', 'Abejas y polinizadores', 'Bees and pollinators', '',
   'En flores, cerca de la quebrada', 'On flowers, near the creek',
   'Sin polinizadores no hay cacao. Verlos trabajando significa que aquí no se usan venenos.',
   'Without pollinators there is no cacao. Seeing them at work means no poisons are used here.',
   'biodiversidad', 'conteo', '🐝', true, 3),
  ('33333333-3333-3333-3333-333333333304', 'Sombra del dosel', 'Canopy shade', '',
   'Mira hacia arriba entre los árboles de cacao', 'Look up between the cacao trees',
   'El cacao regenerativo crece bajo sombra de árboles más altos. Entre más cerrado el dosel, mejor protegido está el suelo y más biodiversidad cabe.',
   'Regenerative cacao grows under taller trees. The more closed the canopy, the better protected the soil and the more biodiversity it holds.',
   'planta', 'escala', '🌳', false, 4),
  ('33333333-3333-3333-3333-333333333305', 'Lombrices de tierra', 'Earthworms', '',
   'Levanta un poco de hojarasca húmeda', 'Lift some damp leaf litter',
   'Son fábricas de suelo vivo. Donde hay lombrices hay materia orgánica, aire y agua en la tierra.',
   'They are living soil factories. Where there are earthworms there is organic matter, air and water in the ground.',
   'suelo', 'si_no', '🪱', true, 5),
  ('33333333-3333-3333-3333-333333333306', 'Agua de la quebrada', 'Creek water', '',
   'Fíjate en el color y si hay espuma', 'Look at the color and whether there is foam',
   'Una foto del agua ayuda a la finca a llevar un registro visual de su claridad a lo largo del año.',
   'A photo of the water helps the farm keep a visual record of its clarity through the year.',
   'agua', 'foto', '💧', true, 6)
on conflict (id) do nothing;

insert into estacion_indicadores (estacion_id, indicador_id, orden) values
  ('22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333301', 1),
  ('22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333302', 2),
  ('22222222-2222-2222-2222-222222222202', '33333333-3333-3333-3333-333333333303', 1),
  ('22222222-2222-2222-2222-222222222202', '33333333-3333-3333-3333-333333333304', 2),
  ('22222222-2222-2222-2222-222222222202', '33333333-3333-3333-3333-333333333305', 3),
  ('22222222-2222-2222-2222-222222222203', '33333333-3333-3333-3333-333333333306', 1)
on conflict (estacion_id, indicador_id) do nothing;

insert into preguntas (id, orden, texto_es, texto_en, tipo, minimo_es, minimo_en, maximo_es, maximo_en) values
  ('44444444-4444-4444-4444-444444444401', 1,
   '¿Qué tanto aprendiste hoy sobre el suelo y el bosque?', 'How much did you learn today about the soil and the forest?',
   'escala', 'Nada nuevo', 'Nothing new', 'Muchísimo', 'So much'),
  ('44444444-4444-4444-4444-444444444402', 2,
   '¿Recomendarías este recorrido a un amigo?', 'Would you recommend this tour to a friend?',
   'escala', 'Para nada', 'Not at all', 'Totalmente', 'Definitely'),
  ('44444444-4444-4444-4444-444444444403', 3,
   '¿Qué fue lo que más te llamó la atención?', 'What caught your attention the most?',
   'texto', null, null, null, null)
on conflict (id) do nothing;
