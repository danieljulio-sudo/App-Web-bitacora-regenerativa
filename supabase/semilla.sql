-- ============================================================================
-- Bitácora Regenerativa · Datos de ejemplo para probar Fase 1
-- ============================================================================
-- Correr DESPUÉS de supabase/schema.sql. Es la ruta de prueba: 1 ruta, 4
-- estaciones, 7 indicadores (los 4 tipos de medición) y 3 preguntas de
-- cierre. El código QR de esta ruta es "ruta-cacao" → /r/ruta-cacao.
--
-- Se puede correr de nuevo sin duplicar nada ("on conflict do nothing" por id).
-- Cuando llegue el catálogo real de la finca, esto se reemplaza desde el
-- panel (Indicadores → Rutas), no hace falta tocar SQL otra vez.
-- ============================================================================

insert into rutas (id, nombre, codigo, descripcion, activa) values
  ('11111111-1111-1111-1111-111111111111', 'Ruta del Cacao', 'ruta-cacao',
   'Recorrido de ejemplo por la finca: caminito de entrada, bosque, cultivo de cacao y área de la casa.', true)
on conflict (id) do nothing;

insert into estaciones (id, ruta_id, orden, nombre_es, nombre_en, descripcion_es, descripcion_en) values
  ('22222222-2222-2222-2222-222222222211', '11111111-1111-1111-1111-111111111111', 1,
   'Caminito de entrada', 'Entry path',
   'El caminito corto antes de tomar el sendero principal — aquí también hay señales que vale la pena mirar.',
   'The short path before the main trail — there are signs worth looking for here too.'),
  ('22222222-2222-2222-2222-222222222212', '11111111-1111-1111-1111-111111111111', 2,
   'Sendero del bosque', 'Forest trail',
   'El sendero que atraviesa el bosque, antes de llegar al cultivo.', 'The trail that crosses the forest, before reaching the crop.'),
  ('22222222-2222-2222-2222-222222222213', '11111111-1111-1111-1111-111111111111', 3,
   'Zona de cacao', 'Cacao area',
   'Los árboles de cacao bajo sombra, en plena producción.', 'The shade-grown cacao trees, in full production.'),
  ('22222222-2222-2222-2222-222222222214', '11111111-1111-1111-1111-111111111111', 4,
   'Área de la casa', 'House area',
   'Alrededor de la casa de la finca: huerta, compostaje y vida cotidiana.', 'Around the farmhouse: garden, composting and everyday life.')
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
   'agua', 'foto', '💧', true, 6),
  ('33333333-3333-3333-3333-333333333307', 'Compostaje casero', 'Home composting', '',
   'Cerca de la cocina o el huerto', 'Near the kitchen or the garden',
   'Compostar los residuos de comida cierra el ciclo: lo que sale de la tierra vuelve a ella en vez de convertirse en basura.',
   'Composting food scraps closes the loop: what comes from the soil goes back to it instead of becoming trash.',
   'suelo', 'si_no', '🌱', true, 7)
on conflict (id) do nothing;

insert into estacion_indicadores (estacion_id, indicador_id, orden) values
  ('22222222-2222-2222-2222-222222222211', '33333333-3333-3333-3333-333333333301', 1), -- diente de león
  ('22222222-2222-2222-2222-222222222211', '33333333-3333-3333-3333-333333333302', 2), -- suelo cubierto
  ('22222222-2222-2222-2222-222222222212', '33333333-3333-3333-3333-333333333305', 1), -- lombrices
  ('22222222-2222-2222-2222-222222222212', '33333333-3333-3333-3333-333333333304', 2), -- sombra del dosel
  ('22222222-2222-2222-2222-222222222213', '33333333-3333-3333-3333-333333333303', 1), -- abejas
  ('22222222-2222-2222-2222-222222222213', '33333333-3333-3333-3333-333333333306', 2), -- agua de la quebrada
  ('22222222-2222-2222-2222-222222222214', '33333333-3333-3333-3333-333333333307', 1)  -- compostaje casero
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
