import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PAISES } from '../../i18n/textos.js'
import { colorPorCategoria } from '../../lib/colorPorCategoria.js'

// Primera pantalla: idioma, nombre, país y correo opcional (RF-01, RF-02).
// No toca la base de datos — solo junta los datos y avisa al padre
// (Visitante.jsx) para que él cree la bitácora.
export default function Bienvenida({ ruta, indicadores, idioma, setIdioma, textos, onIniciar }) {
  const [nombre, setNombre] = useState('')
  const [pais, setPais] = useState(PAISES[0])
  const [correo, setCorreo] = useState('')

  function empezar() {
    const limpio = nombre.trim()
    if (!limpio) return
    onIniciar({ nombreVisitante: limpio, pais, correo: correo.trim() })
  }

  return (
    <>
      <div className="fila-superior">
        <Link to="/" className="back">← {textos.volverInicio}</Link>
        <div className="idiomas" role="group" aria-label={textos.idioma}>
          <button type="button" aria-pressed={idioma === 'es'} onClick={() => setIdioma('es')}>ES</button>
          <button type="button" aria-pressed={idioma === 'en'} onClick={() => setIdioma('en')}>EN</button>
        </div>
      </div>

      <p className="eyebrow">{ruta.nombre}</p>
      <h1>{textos.bienvenidaTitulo}</h1>
      <p>{textos.bienvenidaTexto}</p>

      <div className="preview">
        {indicadores.map((i) => (
          <div
            key={i.id}
            className="thumb"
            style={{ '--acento-local': colorPorCategoria(i.categoria) }}
            title={idioma === 'en' ? i.nombre_en || i.nombre_es : i.nombre_es}
            aria-hidden="true"
          >
            {i.emoji}
          </div>
        ))}
      </div>

      <label htmlFor="nombre">{textos.nombreLabel}</label>
      <input
        id="nombre"
        type="text"
        autoComplete="given-name"
        placeholder={textos.nombrePlaceholder}
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <label htmlFor="pais">{textos.paisLabel}</label>
      <select id="pais" value={pais} onChange={(e) => setPais(e.target.value)}>
        {PAISES.map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>

      <label htmlFor="correo">{textos.correoLabel}</label>
      <input
        id="correo"
        type="email"
        autoComplete="email"
        placeholder={textos.correoPlaceholder}
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
      />

      <div className="stack">
        <button className="btn" type="button" disabled={!nombre.trim()} onClick={empezar}>
          {textos.empezar}
        </button>
        <p className="muted" style={{ textAlign: 'center', margin: 0 }}>{textos.sinSenal}</p>
      </div>
    </>
  )
}
