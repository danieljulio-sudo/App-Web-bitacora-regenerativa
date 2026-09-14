import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { SesionProvider } from './lib/sesion.jsx'

// BASE_URL es la carpeta donde vive la app en GitHub Pages; el enrutador la
// necesita para que /visitante se convierta en /App-Web-bitacora-regenerativa/visitante.
// El catálogo ya no se siembra local y fijo (Paso 5): cada ruta trae el suyo
// desde Supabase la primera vez que alguien la visita con señal — ver
// lib/ruta.js.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SesionProvider>
        <App />
      </SesionProvider>
    </BrowserRouter>
  </StrictMode>,
)
