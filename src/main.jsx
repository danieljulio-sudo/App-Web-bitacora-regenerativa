import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { sembrarCatalogoSiVacio } from './lib/catalogo.js'

// Antes de pintar nada, nos aseguramos de que la base local tenga el
// catálogo de indicadores (no hace nada si ya lo tiene). Esperamos a que
// termine para que la primera pantalla ya encuentre datos.
await sembrarCatalogoSiVacio()

// BASE_URL es la carpeta donde vive la app en GitHub Pages; el enrutador la necesita
// para que /visitante se convierta en /App-Web-bitacora-regenerativa/visitante.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
