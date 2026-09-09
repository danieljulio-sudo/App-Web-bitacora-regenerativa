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
