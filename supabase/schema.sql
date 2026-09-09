-- Esquema para la sincronización del Visitante (Paso 5).
-- Cómo usarlo: Supabase → tu proyecto → SQL Editor → pegar todo → Run.
-- Se puede correr varias veces sin romper nada (los "if not exists" y
-- "or replace" lo permiten).
--
-- Nota sobre las fotos: por ahora NO se sincronizan (se quedan solo en el
-- celular). Subirlas necesita un bucket de Supabase Storage con sus propias
-- reglas, y lo dejamos para un paso aparte a propósito, para no mezclar dos
-- cosas grandes en un solo cambio.   

create table if not exists bitacoras (
  id uuid primary key,
  creada_en timestamptz not null,
  enviada_en timestamptz not null,
  nombre_visitante text not null,
  pais text,
  aprendizaje smallint,
  comentario text,
  -- cuándo la recibió Supabase (distinto de enviada_en, que es la hora del
  -- celular; si el visitante estaba sin señal, esta fecha llega después).
  recibida_en timestamptz not null default now()
);

create table if not exists observaciones (
  -- mismo id que arma la app en el celular: "<bitacoraId>:<indicadorId>".
  id text primary key,
  bitacora_id uuid not null references bitacoras (id) on delete cascade,
  indicador_id text not null,
  visto boolean not null,
  cantidad int not null default 0
);

create index if not exists observaciones_bitacora_id_idx on observaciones (bitacora_id);

-- RLS (Row Level Security): la anon key es pública, así que sin estas
-- reglas cualquiera podría leer, cambiar o borrar todo con solo tener la
-- key. Dejamos que la app anónima SOLO pueda insertar (subir su bitácora)
-- — ni leer, ni cambiar, ni borrar nada. Leer los datos será trabajo del
-- panel Admin, con su propio usuario autenticado (Paso 7).
--
-- Ojo: a propósito NO hay política de "select" ni de "update".
-- - Sin "update": si existiera con `using (true)` (para poder reintentar
--   una subida sin error de "ya existe"), cualquiera con la anon key
--   podría sobrescribir la bitácora de otra persona, porque no guardamos
--   quién es "dueño" de cada fila.
-- - Sin "select": probamos primero resolver los reintentos con
--   "insertar y si ya existe no hacer nada" (ON CONFLICT DO NOTHING) del
--   lado de Postgres, pero resulta que ESO sí necesita poder leer la tabla
--   (Postgres tiene que poder comparar si hay conflicto). Así que el
--   reintento se resuelve en el código de la app (src/lib/sincronizar.js):
--   intenta un insert normal, y si Postgres responde "ya existe"
--   (unique_violation, 23505) lo toma como éxito en vez de error.
alter table bitacoras enable row level security;
alter table observaciones enable row level security;

-- Usamos la llave "anon" clásica (formato JWT) para conectar la app, así
-- que la regla apunta directo a ese rol: es el comportamiento bien probado
-- de Supabase, sin depender de cómo el sistema de llaves nuevo
-- (publishable/secret) resuelva el rol por dentro.
drop policy if exists "anon puede insertar bitacoras" on bitacoras;
drop policy if exists "insertar bitacoras" on bitacoras;
create policy "insertar bitacoras"
  on bitacoras for insert
  to anon
  with check (true);

drop policy if exists "anon puede insertar observaciones" on observaciones;
drop policy if exists "insertar observaciones" on observaciones;
create policy "insertar observaciones"
  on observaciones for insert
  to anon
  with check (true);
