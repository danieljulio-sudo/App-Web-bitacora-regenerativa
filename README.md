# Bitácora Regenerativa

App web para medir el impacto regenerativo de recorridos de cacao: el visitante registra
señales de regeneración durante el recorrido, el guía valida y la finca ve resultados en el tiempo.

- **Código (rama `main`)**: proyecto React + Vite en esta carpeta.
- **Sitio publicado (rama `gh-pages`)**: https://danieljulio-sudo.github.io/App-Web-bitacora-regenerativa/
- **Demo estático** (prototipo v0.1): `public/demo/` → `/demo/` en el sitio.

## Comandos

```bash
npm install       # instalar dependencias (una vez)
npm run dev       # servidor local para desarrollar
npm run build     # compilar a la carpeta dist/
npm run deploy    # compilar y publicar en GitHub Pages
```

## Claves

Copiar `.env.example` como `.env` y pegar la URL y la anon key del proyecto en Supabase. El `.env` no se sube.

## Base de datos en Supabase

Las tablas y las reglas de acceso (RLS) viven en [`supabase/schema.sql`](supabase/schema.sql), versionadas junto al código. Para aplicarlas, en orden:

1. **Supabase → tu proyecto → SQL Editor → pegar `schema.sql` → Run.** Antes de correrlo, edita la línea que dice `correo_admin_inicial` y pon ahí el correo real de quien va a administrar esta finca — es el único correo que puede auto-asignarse administrador al registrarse (ver "Seguridad" abajo). Se puede volver a correr sin problema si cambia algo (usa `if not exists` / `drop policy if exists`).
2. **`semilla.sql`** (opcional, solo para probar): ruta y catálogo de ejemplo.
3. Entra a `/admin`, "Todavía no tengo cuenta", regístrate con ese mismo correo — quedas admin automático. Desde ahí invitas a los guías y cargas el catálogo real.

### Seguridad: solo un correo puede ser el primer admin

A propósito NO es "quien se registre primero" — eso sería una carrera: cualquiera que encontrara la URL antes que el admin real se quedaría con el control del sistema para siempre. En vez de eso, solo el correo guardado en la tabla `ajustes` (columna `correo_admin_inicial`) puede auto-asignarse admin, sin importar cuándo se registre. Esa tabla no se puede leer ni escribir por la API (ni siquiera un admin autenticado) — solo se cambia desde el SQL Editor.
