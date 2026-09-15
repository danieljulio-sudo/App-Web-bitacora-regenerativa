-- ============================================================================
-- Bitácora Regenerativa · Cierra el hueco de seguridad "el primero es admin"
-- ============================================================================
-- Antes de esto, quien se registrara PRIMERO en el proyecto quedaba admin
-- automático — una carrera: cualquiera que encontrara la URL antes que el
-- admin real se quedaba con el control de todo. Ahora solo el correo
-- configurado en `ajustes` puede auto-asignarse admin, sin importar el
-- orden.
--
-- Este script SOLO toca lo nuevo — no borra nada de lo que ya tienes
-- probado (rutas, indicadores, recorridos, bitácoras). Si vas a instalar
-- el proyecto desde cero, no hace falta correr esto aparte: ya está incluido
-- en schema.sql.
--
-- Corre esto UNA vez en el SQL Editor.
-- ============================================================================

create table if not exists ajustes (
  clave text primary key,
  valor text not null
);

alter table ajustes enable row level security;
-- A propósito SIN ninguna política: ni admin, ni nadie, la lee ni la
-- escribe por la API. Solo la toca manejar_nuevo_usuario() (más abajo),
-- que es "security definer" y por eso sí puede, aunque no haya política.

-- Cambia el correo de abajo si el admin real de esta finca es otra persona.
insert into ajustes (clave, valor) values ('correo_admin_inicial', 'daniel.julio@12tree.ag')
on conflict (clave) do update set valor = excluded.valor;

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
