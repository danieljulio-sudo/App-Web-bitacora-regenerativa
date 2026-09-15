-- ============================================================================
-- Bitácora Regenerativa · Esquema v1 (Fase 1 de la propuesta)
-- ============================================================================
-- Cómo usarlo: Supabase → tu proyecto → SQL Editor → pegar TODO → Run.
-- Después correr supabase/semilla.sql para cargar los datos de ejemplo.
--
-- ⚠️  Este esquema REEMPLAZA al de la versión anterior (Paso 5). Las tablas
--     viejas `bitacoras` y `observaciones` tenían otra forma y se borran con
--     sus datos de prueba. Si hay algo ahí que quieras conservar, expórtalo
--     antes desde Table Editor.
--
-- Se puede volver a correr sin romper nada: todo usa "if not exists",
-- "or replace" o "drop ... if exists" antes de crear.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 0. Limpieza de la versión anterior
-- ----------------------------------------------------------------------------
drop table if exists observaciones cascade;
drop table if exists bitacoras cascade;

-- ----------------------------------------------------------------------------
-- 1. Personas del equipo: perfiles, roles e invitaciones (RF-20)
-- ----------------------------------------------------------------------------
-- Cada usuario de Supabase Auth (correo + contraseña) tiene un perfil con su
-- rol. La primera persona que se registre en un proyecto vacío queda como
-- admin. Las siguientes solo reciben rol si el admin las invitó antes por
-- correo desde el panel; si alguien se registra sin invitación, queda con el
-- perfil inactivo y no puede ver nada.
create table if not exists perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  correo text not null,
  nombre text,
  rol text not null check (rol in ('admin', 'guia')),
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

create table if not exists invitaciones (
  correo text primary key,
  rol text not null check (rol in ('admin', 'guia')),
  nombre text,
  creada_en timestamptz not null default now()
);

-- El único correo que puede quedar como admin SIN que nadie lo invite antes
-- — normalmente quien está montando el proyecto. Antes se le daba admin a
-- "quien se registre primero", pero eso es una carrera: cualquiera que
-- encontrara la URL antes que el admin real se quedaba con el control de
-- todo el sistema para siempre. Con esto, no importa el orden — solo este
-- correo puede auto-asignarse admin.
--
-- ⚠️  Si estás montando este proyecto para OTRA finca (no la de prueba de
--     Daniel), cambia el valor de abajo por el correo real del administrador
--     antes de correr este script.
create table if not exists ajustes (
  clave text primary key,
  valor text not null
);
insert into ajustes (clave, valor) values ('correo_admin_inicial', 'daniel.julio@12tree.ag')
on conflict (clave) do update set valor = excluded.valor;

-- Funciones de ayuda para las reglas de acceso. "security definer" hace que
-- corran con permisos del dueño y no del usuario, así pueden leer `perfiles`
-- aunque el usuario mismo no tenga permiso de leer los perfiles de los demás.
create or replace function rol_actual() returns text
language sql stable security definer set search_path = public as $$
  select rol from perfiles where id = auth.uid() and activo
$$;

create or replace function es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select rol_actual()) = 'admin', false)
$$;

create or replace function es_equipo() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select rol_actual()) in ('admin', 'guia'), false)
$$;

-- Al crearse un usuario en Auth se le crea su perfil automáticamente.
create or replace function manejar_nuevo_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  inv invitaciones%rowtype;
  correo_admin text;
  nombre_meta text := new.raw_user_meta_data ->> 'nombre';
begin
  select valor into correo_admin from ajustes where clave = 'correo_admin_inicial';
  select * into inv from invitaciones where lower(correo) = lower(new.email);

  if correo_admin is not null and lower(new.email) = lower(correo_admin) then
    insert into perfiles (id, correo, nombre, rol)
    values (new.id, new.email, coalesce(nombre_meta, split_part(new.email, '@', 1)), 'admin');
  elsif inv.correo is not null then
    insert into perfiles (id, correo, nombre, rol)
    values (new.id, new.email, coalesce(nombre_meta, inv.nombre, split_part(new.email, '@', 1)), inv.rol);
    delete from invitaciones where correo = inv.correo;
  else
    insert into perfiles (id, correo, nombre, rol, activo)
    values (new.id, new.email, coalesce(nombre_meta, split_part(new.email, '@', 1)), 'guia', false);
  end if;
  return new;
end
$$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function manejar_nuevo_usuario();

-- ----------------------------------------------------------------------------
-- 2. Catálogo: indicadores, rutas, estaciones, preguntas (RF-13, RF-14, RF-06)
-- ----------------------------------------------------------------------------
create table if not exists indicadores (
  id uuid primary key default gen_random_uuid(),
  nombre_es text not null,
  nombre_en text,
  nombre_cientifico text,
  pista_es text,                 -- dónde buscarlo ("bajo los árboles de cacao")
  pista_en text,
  explicacion_es text,           -- por qué importa
  explicacion_en text,
  categoria text,                -- suelo | biodiversidad | agua | planta | otro
  tipo_medicion text not null check (tipo_medicion in ('conteo', 'si_no', 'escala', 'foto')),
  emoji text,                    -- se usa mientras no haya foto
  foto_path text,                -- ruta dentro del bucket "catalogo"
  pide_foto boolean not null default true,
  activo boolean not null default true,
  orden int not null default 0,
  creado_en timestamptz not null default now()
);

create table if not exists rutas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  codigo text not null unique,   -- va en el QR: /r/<codigo>
  descripcion text,
  activa boolean not null default true,
  creada_en timestamptz not null default now()
);

create table if not exists estaciones (
  id uuid primary key default gen_random_uuid(),
  ruta_id uuid not null references rutas (id) on delete cascade,
  orden int not null default 0,
  nombre_es text not null,
  nombre_en text,
  descripcion_es text,
  descripcion_en text,
  foto_path text,
  activa boolean not null default true
);
create index if not exists estaciones_ruta_idx on estaciones (ruta_id, orden);

create table if not exists estacion_indicadores (
  estacion_id uuid not null references estaciones (id) on delete cascade,
  indicador_id uuid not null references indicadores (id) on delete cascade,
  orden int not null default 0,
  primary key (estacion_id, indicador_id)
);

-- Preguntas de percepción al cierre. Son de la finca (no de una ruta).
create table if not exists preguntas (
  id uuid primary key default gen_random_uuid(),
  orden int not null default 0,
  texto_es text not null,
  texto_en text,
  tipo text not null default 'escala' check (tipo in ('escala', 'texto')),
  minimo_es text, minimo_en text,   -- etiquetas de los extremos de la escala 1-5
  maximo_es text, maximo_en text,
  activa boolean not null default true
);

-- ----------------------------------------------------------------------------
-- 3. Recorridos y bitácoras (RF-09 a RF-12, RF-16)
-- ----------------------------------------------------------------------------
create table if not exists recorridos (
  id uuid primary key,
  ruta_id uuid not null references rutas (id),
  guia_id uuid references auth.users (id),
  fecha date not null default current_date,
  tamano_grupo int,
  iniciado_en timestamptz not null default now(),
  cerrado_en timestamptz,
  estado text not null default 'abierto' check (estado in ('abierto', 'cerrado', 'validado')),
  notas text,
  creado_en timestamptz not null default now()
);
create index if not exists recorridos_ruta_fecha_idx on recorridos (ruta_id, fecha);

create table if not exists bitacoras (
  id uuid primary key,
  ruta_id uuid references rutas (id),
  recorrido_id uuid references recorridos (id) on delete set null,
  origen text not null default 'visitante' check (origen in ('visitante', 'guia')),
  idioma text not null default 'es',
  nombre_visitante text not null,
  pais text,
  correo text,
  comentario text,
  creada_en timestamptz not null,    -- hora del celular al empezar
  enviada_en timestamptz not null,   -- hora del celular al terminar
  recibida_en timestamptz not null default now()   -- cuándo llegó a Supabase
);
create index if not exists bitacoras_ruta_creada_idx on bitacoras (ruta_id, creada_en);
create index if not exists bitacoras_recorrido_idx on bitacoras (recorrido_id);

create table if not exists observaciones (
  -- id armado en el celular: "<bitacoraId>:<estacionId>:<indicadorId>", o
  -- "<bitacoraId>:<estacionId>:libre:<uuid>" para un hallazgo sin catálogo.
  id text primary key,
  bitacora_id uuid not null references bitacoras (id) on delete cascade,
  estacion_id uuid references estaciones (id) on delete set null,
  indicador_id uuid references indicadores (id) on delete set null,
  nombre_libre text,               -- "vi algo que no está en la lista": cómo lo describió quien lo vio
  visto boolean not null,
  cantidad int not null default 0,
  escala smallint,
  foto_path text,                 -- ruta dentro del bucket "fotos"
  creada_en timestamptz not null default now()
);
create index if not exists observaciones_bitacora_idx on observaciones (bitacora_id);

create table if not exists respuestas (
  id text primary key,            -- "<bitacoraId>:<preguntaId>"
  bitacora_id uuid not null references bitacoras (id) on delete cascade,
  pregunta_id uuid references preguntas (id) on delete set null,
  valor_num smallint,
  valor_texto text
);
create index if not exists respuestas_bitacora_idx on respuestas (bitacora_id);

-- Lo que el guía decide sobre cada indicador de cada estación del recorrido.
create table if not exists validaciones (
  id uuid primary key default gen_random_uuid(),
  recorrido_id uuid not null references recorridos (id) on delete cascade,
  estacion_id uuid not null references estaciones (id) on delete cascade,
  indicador_id uuid not null references indicadores (id) on delete cascade,
  decision text not null check (decision in ('confirmada', 'ajustada', 'descartada')),
  valor_final numeric,
  nota text,
  validado_por uuid references auth.users (id),
  validado_en timestamptz not null default now(),
  unique (recorrido_id, estacion_id, indicador_id)
);

-- ----------------------------------------------------------------------------
-- 4. Reglas de acceso (RLS)
-- ----------------------------------------------------------------------------
-- La anon key es pública. Sin estas reglas cualquiera podría leer o borrar
-- todo. Resumen:
--   · anónimo (visitante):  lee el catálogo, inserta bitácoras. Nada más.
--   · guía:                 además lee bitácoras, crea/cierra sus recorridos
--                           y guarda validaciones.
--   · admin:                todo.
alter table perfiles            enable row level security;
alter table invitaciones        enable row level security;
alter table ajustes             enable row level security;
alter table indicadores         enable row level security;
alter table rutas               enable row level security;
alter table estaciones          enable row level security;
alter table estacion_indicadores enable row level security;
alter table preguntas           enable row level security;
alter table recorridos          enable row level security;
alter table bitacoras           enable row level security;
alter table observaciones       enable row level security;
alter table respuestas          enable row level security;
alter table validaciones        enable row level security;

-- perfiles: cada quien ve el suyo; el admin ve y edita todos.
drop policy if exists "perfil propio" on perfiles;
create policy "perfil propio" on perfiles for select to authenticated using (id = auth.uid());
drop policy if exists "admin ve perfiles" on perfiles;
create policy "admin ve perfiles" on perfiles for select to authenticated using (es_admin());
drop policy if exists "admin edita perfiles" on perfiles;
create policy "admin edita perfiles" on perfiles for update to authenticated using (es_admin()) with check (es_admin());

-- ajustes: a propósito SIN ninguna política — ni admin, ni nadie, puede
-- leerla ni escribirla por la API. Solo la función manejar_nuevo_usuario()
-- la toca, porque es "security definer" (corre con permisos del dueño de la
-- tabla, no del usuario que dispara el trigger) y eso salta el RLS. Si
-- tuviera una política aunque fuera "solo admin puede leer/escribir", un
-- admin comprometido (o el primer admin real, antes de tiempo) podría
-- cambiar el correo y dárselo a otra persona — mejor que ni eso se pueda.
drop policy if exists "admin invitaciones" on invitaciones;
create policy "admin invitaciones" on invitaciones for all to authenticated using (es_admin()) with check (es_admin());

-- catálogo: todos leen, admin edita.
do $$
declare t text;
begin
  foreach t in array array['indicadores', 'rutas', 'estaciones', 'estacion_indicadores', 'preguntas'] loop
    execute format('drop policy if exists "leer %s" on %I', t, t);
    execute format('create policy "leer %s" on %I for select to anon, authenticated using (true)', t, t);
    execute format('drop policy if exists "admin %s" on %I', t, t);
    execute format('create policy "admin %s" on %I for all to authenticated using (es_admin()) with check (es_admin())', t, t);
  end loop;
end $$;

-- recorridos: el equipo los ve; el guía crea y edita los suyos; admin todo.
drop policy if exists "equipo ve recorridos" on recorridos;
create policy "equipo ve recorridos" on recorridos for select to authenticated using (es_equipo());
drop policy if exists "guia crea recorridos" on recorridos;
create policy "guia crea recorridos" on recorridos for insert to authenticated with check (es_equipo() and guia_id = auth.uid());
drop policy if exists "guia edita sus recorridos" on recorridos;
create policy "guia edita sus recorridos" on recorridos for update to authenticated using (es_admin() or guia_id = auth.uid()) with check (es_admin() or guia_id = auth.uid());
drop policy if exists "admin borra recorridos" on recorridos;
create policy "admin borra recorridos" on recorridos for delete to authenticated using (es_admin());

-- bitácoras y sus hijas: cualquiera inserta (así sube el visitante sin
-- cuenta), el equipo lee, solo admin borra. A propósito NO hay update: sin
-- dueño por fila, un update abierto dejaría que cualquiera con la anon key
-- cambiara la bitácora de otra persona. Los reintentos de subida se
-- resuelven en la app tratando el "ya existe" (23505) como éxito.
do $$
declare t text;
begin
  foreach t in array array['bitacoras', 'observaciones', 'respuestas'] loop
    execute format('drop policy if exists "insertar %s" on %I', t, t);
    execute format('create policy "insertar %s" on %I for insert to anon, authenticated with check (true)', t, t);
    execute format('drop policy if exists "equipo lee %s" on %I', t, t);
    execute format('create policy "equipo lee %s" on %I for select to authenticated using (es_equipo())', t, t);
    execute format('drop policy if exists "admin borra %s" on %I', t, t);
    execute format('create policy "admin borra %s" on %I for delete to authenticated using (es_admin())', t, t);
  end loop;
end $$;

-- validaciones: el equipo completo las VE, pero solo el guía dueño del
-- recorrido (o un admin) puede confirmar/ajustar/descartar — antes
-- "equipo validaciones" dejaba a cualquier guía tocar las validaciones de
-- un recorrido ajeno, porque es_equipo() solo mira el rol, no de quién es
-- el recorrido (a diferencia de "guia edita sus recorridos" arriba, que sí
-- lo hace).
drop policy if exists "equipo validaciones" on validaciones;
drop policy if exists "equipo ve validaciones" on validaciones;
create policy "equipo ve validaciones" on validaciones for select to authenticated using (es_equipo());
drop policy if exists "guia valida sus recorridos" on validaciones;
create policy "guia valida sus recorridos" on validaciones for all to authenticated
  using (es_admin() or exists (select 1 from recorridos r where r.id = recorrido_id and r.guia_id = auth.uid()))
  with check (es_admin() or exists (select 1 from recorridos r where r.id = recorrido_id and r.guia_id = auth.uid()));

-- ----------------------------------------------------------------------------
-- 5. Fotos (Storage)
-- ----------------------------------------------------------------------------
-- Dos buckets públicos para lectura (las fotos son de naturaleza, RNF-06):
--   · fotos:    evidencia que suben los visitantes. Anónimo solo sube.
--   · catalogo: fotos de indicadores y estaciones. Solo admin sube/borra.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 2097152;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalogo', 'catalogo', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 2097152;

drop policy if exists "leer fotos" on storage.objects;
create policy "leer fotos" on storage.objects for select to anon, authenticated using (bucket_id in ('fotos', 'catalogo'));
drop policy if exists "subir fotos" on storage.objects;
create policy "subir fotos" on storage.objects for insert to anon, authenticated with check (bucket_id = 'fotos');
drop policy if exists "admin borra fotos" on storage.objects;
create policy "admin borra fotos" on storage.objects for delete to authenticated using (bucket_id in ('fotos', 'catalogo') and es_admin());
drop policy if exists "admin sube catalogo" on storage.objects;
create policy "admin sube catalogo" on storage.objects for insert to authenticated with check (bucket_id = 'catalogo' and es_admin());
drop policy if exists "admin cambia catalogo" on storage.objects;
create policy "admin cambia catalogo" on storage.objects for update to authenticated using (bucket_id = 'catalogo' and es_admin()) with check (bucket_id = 'catalogo' and es_admin());
