import { useState } from 'react'
import { campo } from '../../i18n/textos.js'
import { colorPorCategoria } from '../../lib/colorPorCategoria.js'
import { crearHallazgo, eliminarHallazgo, guardarFoto } from '../../lib/bitacoraVisitante.js'
import { comprimirFoto } from '../../lib/foto.js'

// Indicadores de una sola estación (RF-03/RF-04). Misma idea que
// Estaciones.jsx pero un nivel más adentro. Al final se agrega "¿viste algo
// que no está aquí?" — el catálogo no puede cubrir todo lo que hay en la
// finca de entrada, así que esto deja que el recorrido mismo lo alimente;
// el admin revisa después y decide si pasa a ser un indicador oficial.
export default function Estacion({ estacion, observaciones, bitacoraId, idioma, textos, onAbrir, onVolver }) {
  const [agregando, setAgregando] = useState(false)
  const [nombreLibre, setNombreLibre] = useState('')
  const [foto, setFoto] = useState(null)
  const [comprimiendo, setComprimiendo] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const hallazgos = observaciones.filter((o) => o.estacionId === estacion.id && !o.indicadorId)

  async function elegirFoto(e) {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    setComprimiendo(true)
    try {
      setFoto(await comprimirFoto(archivo))
    } finally {
      setComprimiendo(false)
    }
  }

  function cancelar() {
    setAgregando(false)
    setNombreLibre('')
    setFoto(null)
  }

  async function guardar() {
    if (!nombreLibre.trim()) return
    setGuardando(true)
    try {
      const id = await crearHallazgo(bitacoraId, estacion.id, nombreLibre.trim())
      if (foto) await guardarFoto(id, foto)
      cancelar()
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <button className="back" type="button" onClick={onVolver}>{textos.volverALista}</button>
      <p className="eyebrow">{campo(estacion, 'nombre', idioma)}</p>
      <h2>{campo(estacion, 'descripcion', idioma) || campo(estacion, 'nombre', idioma)}</h2>

      <div className="tarjetas">
        {estacion.indicadores.map((i) => {
          const o = observaciones.find((x) => x.indicadorId === i.id)
          return (
            <button key={i.id} className="tarjeta" type="button" onClick={() => onAbrir(i.id)}>
              <div className="tarjeta-img" style={{ '--acento-local': colorPorCategoria(i.categoria) }} aria-hidden="true">{i.emoji}</div>
              {o?.tieneFoto && <span className="photo-dot">📷</span>}
              <div className="tarjeta-body">
                <div className="tarjeta-nombre">{campo(i, 'nombre', idioma)}</div>
                <div className="tarjeta-pista">{campo(i, 'pista', idioma)}</div>
                {!o && <div className="estado pendiente">{textos.tocaParaRegistrar}</div>}
                {o && o.visto && (
                  <div className="estado">
                    <span className="pill">
                      {i.tipoMedicion === 'conteo' && textos.vistos(o.cantidad)}
                      {i.tipoMedicion === 'escala' && `${o.escala} / 5`}
                      {(i.tipoMedicion === 'si_no' || i.tipoMedicion === 'foto') && textos.visto}
                    </span>
                  </div>
                )}
                {o && !o.visto && (
                  <div className="estado">
                    <span className="pill off">{textos.noVisto}</span>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="stack">
        {hallazgos.length > 0 && (
          <div className="hallazgos">
            {hallazgos.map((h) => (
              <div key={h.id} className="hallazgo-fila">
                <span className="hallazgo-nombre">🔍 {h.nombreLibre}</span>
                <button type="button" className="hallazgo-quitar" onClick={() => eliminarHallazgo(h.id)} aria-label={textos.hallazgoEliminar}>✕</button>
              </div>
            ))}
          </div>
        )}

        {!agregando ? (
          <button className="btn ghost" type="button" onClick={() => setAgregando(true)}>🔍 {textos.hallazgoAgregar}</button>
        ) : (
          <div className="hallazgo-form">
            <div className="q">{textos.hallazgoTitulo}</div>
            <p className="muted">{textos.hallazgoTexto}</p>
            <input
              type="text" value={nombreLibre} onChange={(e) => setNombreLibre(e.target.value)}
              placeholder={textos.hallazgoPlaceholder} autoFocus
            />
            <div className="photo">
              {foto && <img src={foto} alt="" />}
              <label className="btn ghost">
                {comprimiendo ? textos.comprimiendo : foto ? textos.cambiarFoto : textos.tomarFoto}
                <input className="file" type="file" accept="image/*" capture="environment" onChange={elegirFoto} disabled={comprimiendo} />
              </label>
            </div>
            <div className="stack" style={{ paddingTop: 12 }}>
              <button className="btn" type="button" disabled={!nombreLibre.trim() || guardando} onClick={guardar}>
                {guardando ? textos.enviando : textos.hallazgoGuardar}
              </button>
              <button className="btn ghost" type="button" onClick={cancelar}>{textos.hallazgoCancelar}</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
