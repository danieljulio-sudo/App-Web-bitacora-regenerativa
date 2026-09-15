-- ============================================================================
-- Arregla un hueco de seguridad: "equipo validaciones" dejaba a cualquier
-- guía confirmar/ajustar/descartar las validaciones de un recorrido AJENO
-- (solo miraba el rol, no de quién era el recorrido). Ahora solo puede
-- escribir el guía dueño del recorrido, o un admin. Ver el recorrido
-- completo lo sigue viendo todo el equipo.
-- Correr UNA VEZ en Supabase → tu proyecto → SQL Editor → pegar → Run.
-- No borra ninguna validación ya guardada, solo cambia quién puede escribir.
-- ============================================================================
drop policy if exists "equipo validaciones" on validaciones;
drop policy if exists "equipo ve validaciones" on validaciones;
create policy "equipo ve validaciones" on validaciones for select to authenticated using (es_equipo());

drop policy if exists "guia valida sus recorridos" on validaciones;
create policy "guia valida sus recorridos" on validaciones for all to authenticated
  using (es_admin() or exists (select 1 from recorridos r where r.id = recorrido_id and r.guia_id = auth.uid()))
  with check (es_admin() or exists (select 1 from recorridos r where r.id = recorrido_id and r.guia_id = auth.uid()));
