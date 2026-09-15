import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import RequiereSesion from './components/RequiereSesion.jsx'
import { IdiomaProvider } from './i18n/IdiomaContext.jsx'
import Inicio from './pages/Inicio.jsx'
import Visitante from './pages/visitante/Visitante.jsx'
import GuiaPanel from './pages/guia/Panel.jsx'
import GuiaRecorrido from './pages/guia/Recorrido.jsx'
import AdminPanel from './pages/admin/Panel.jsx'
import AdminIndicadores from './pages/admin/Indicadores.jsx'
import AdminRutas from './pages/admin/Rutas.jsx'
import AdminPreguntas from './pages/admin/Preguntas.jsx'
import AdminRecorridos from './pages/admin/Recorridos.jsx'
import AdminUsuarios from './pages/admin/Usuarios.jsx'

// Cada <Route> une una dirección con una pantalla. El Layout (cabecera +
// estado de conexión) envuelve a todas. /guia y /admin están detrás de
// <RequiereSesion>, que exige haber iniciado sesión con el rol que toca
// (ver components/RequiereSesion.jsx).
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Inicio />} />

        {/* RF-01: el visitante entra escaneando el QR de su ruta. */}
        <Route path="/r/:codigo" element={<IdiomaProvider><Visitante /></IdiomaProvider>} />
        <Route path="/visitante" element={<IdiomaProvider><Visitante /></IdiomaProvider>} />

        <Route path="/guia" element={<RequiereSesion />}>
          <Route index element={<GuiaPanel />} />
          <Route path="recorrido/:id" element={<GuiaRecorrido />} />
        </Route>

        <Route path="/admin" element={<RequiereSesion rol="admin" />}>
          <Route element={<AdminPanel />}>
            <Route index element={<Navigate to="indicadores" replace />} />
            <Route path="indicadores" element={<AdminIndicadores />} />
            <Route path="rutas" element={<AdminRutas />} />
            <Route path="preguntas" element={<AdminPreguntas />} />
            <Route path="recorridos" element={<AdminRecorridos />} />
            <Route path="usuarios" element={<AdminUsuarios />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
