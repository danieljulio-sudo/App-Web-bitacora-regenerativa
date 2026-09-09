// GitHub Pages no conoce nuestras direcciones internas (/visitante, /guia...).
// Copiando index.html como 404.html, cualquier dirección abre la app y React decide qué mostrar.
import { copyFileSync } from 'node:fs'
copyFileSync('dist/index.html', 'dist/404.html')
console.log('404.html listo para GitHub Pages')
