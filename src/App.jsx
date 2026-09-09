import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Inicio from './pages/Inicio.jsx'
import Visitante from './pages/Visitante.jsx'
import Guia from './pages/Guia.jsx'
import Admin from './pages/Admin.jsx'

// Cada <Route> une una dirección con una pantalla.
// El Layout (cabecera + estado de conexión) envuelve a todas.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/visitante" element={<Visitante />} />
        <Route path="/guia" element={<Guia />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Routes>
  )
}
