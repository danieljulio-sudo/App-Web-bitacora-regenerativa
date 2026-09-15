-- ============================================================================
-- Agrega la columna nombre_libre a observaciones (hallazgos sin catálogo).
-- Correr UNA VEZ en Supabase → tu proyecto → SQL Editor → pegar → Run.
-- No borra nada, solo agrega una columna nueva (queda vacía en las filas
-- que ya existen).
-- ============================================================================
alter table observaciones add column if not exists nombre_libre text;
