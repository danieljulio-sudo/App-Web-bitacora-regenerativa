import { useState } from 'react'
import { PAISES } from '../../lib/catalogo.js'

// Primera pantalla: pide nombre y país, y muestra un adelanto de las señales
// que va a buscar. No toca la base de datos — solo junta los datos y avisa
// al padre (Visitante.jsx) para que él cree la bitácora.
export default function Bienvenida({ indicadores, onIniciar }) {
  const [nombre, setNombre] = useState('')
  const [pais, setPais] = useState(PAISES[0])

  function empezar() {
    const limpio = nombre.trim()
    if (!limpio) return
    onIniciar({ nombreVisitante: limpio, pais })
  }

  return (
    <>
      <p className="eyebrow">Ruta del Cacao</p>
      <h1>Hoy vas a ayudar a medir cómo se regenera este bosque</h1>
      <p>Durante el recorrido busca estas señales de regeneración y marca lo que veas. Toma menos de un minuto por señal.</p>

      <div className="preview">
        {indicadores.map((i) => (
          <div key={i.id} className="thumb" title={i.nombre} aria-hidden="true">{i.emoji}</div>
        ))}
      </div>

      <label htmlFor="nombre">¿Cómo te llamas?</label>
      <input
        id="nombre"
        type="text"
        autoComplete="given-name"
        placeholder="Tu nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <label htmlFor="pais">¿De dónde vienes?</label>
      <select id="pais" value={pais} onChange={(e) => setPais(e.target.value)}>
        {PAISES.map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>

      <div className="stack">
        <button className="btn" type="button" disabled={!nombre.trim()} onClick={empezar}>
          Empezar el recorrido
        </button>
        <p className="muted" style={{ textAlign: 'center', margin: 0 }}>
          Funciona sin señal. Tus respuestas quedan guardadas en este celular.
        </p>
      </div>
    </>
  )
}
