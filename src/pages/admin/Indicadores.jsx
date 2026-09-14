import { useEffect, useState } from 'react'
import { listarIndicadores, guardarIndicador, desactivarIndicador, subirFotoIndicador } from '../../lib/admin.js'
import { comprimirFoto } from '../../lib/foto.js'
import { urlPublica } from '../../lib/supabase.js'

const VACIO = {
  id: null, nombre_es: '', nombre_en: '', nombreCientifico: '', categoria: '', tipoMedicion: 'conteo',
  emoji: '', pideFoto: true, pista_es: '', pista_en: '', explicacion_es: '', explicacion_en: '',
}

// RF-13: crear, editar y desactivar indicadores. Un indicador desactivado
// no se borra (para no perder el histórico de observaciones que ya lo
// usaron) — simplemente deja de ofrecerse al asignarlo a una estación nueva.
export default function Indicadores() {
  const [lista, setLista] = useState(null)
  const [form, setForm] = useState(VACIO)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function recargar() {
    setLista(await listarIndicadores())
  }

  useEffect(() => { recargar() }, [])

  function editar(i) {
    setForm({
      id: i.id, nombre_es: i.nombre_es, nombre_en: i.nombre_en || '', nombreCientifico: i.nombre_cientifico || '',
      categoria: i.categoria || '', tipoMedicion: i.tipo_medicion, emoji: i.emoji || '', pideFoto: i.pide_foto,
      pista_es: i.pista_es || '', pista_en: i.pista_en || '', explicacion_es: i.explicacion_es || '', explicacion_en: i.explicacion_en || '',
    })
  }

  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      await guardarIndicador(form)
      setForm(VACIO)
      await recargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function subirFoto(id, e) {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    const dataUrl = await comprimirFoto(archivo, 900, 0.75)
    await subirFotoIndicador(id, dataUrl)
    await recargar()
  }

  return (
    <>
      <h2>{form.id ? 'Editar indicador' : 'Nuevo indicador'}</h2>
      <form onSubmit={guardar}>
        <label htmlFor="nombre_es">Nombre (español)</label>
        <input id="nombre_es" required value={form.nombre_es} onChange={(e) => setForm({ ...form, nombre_es: e.target.value })} />
        <label htmlFor="nombre_en">Nombre (inglés)</label>
        <input id="nombre_en" value={form.nombre_en} onChange={(e) => setForm({ ...form, nombre_en: e.target.value })} />
        <label htmlFor="cientifico">Nombre científico (opcional)</label>
        <input id="cientifico" value={form.nombreCientifico} onChange={(e) => setForm({ ...form, nombreCientifico: e.target.value })} />
        <label htmlFor="categoria">Categoría</label>
        <input id="categoria" placeholder="suelo, biodiversidad, agua, planta…" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
        <label htmlFor="tipo">Tipo de medición</label>
        <select id="tipo" value={form.tipoMedicion} onChange={(e) => setForm({ ...form, tipoMedicion: e.target.value })}>
          <option value="conteo">Conteo (¿cuántos viste?)</option>
          <option value="si_no">Sí / no</option>
          <option value="escala">Escala 1 a 5</option>
          <option value="foto">Solo foto de evidencia</option>
        </select>
        <label htmlFor="emoji">Emoji (mientras no haya foto)</label>
        <input id="emoji" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
        <label htmlFor="pista_es">Pista, dónde buscarlo (español)</label>
        <input id="pista_es" value={form.pista_es} onChange={(e) => setForm({ ...form, pista_es: e.target.value })} />
        <label htmlFor="pista_en">Pista (inglés)</label>
        <input id="pista_en" value={form.pista_en} onChange={(e) => setForm({ ...form, pista_en: e.target.value })} />
        <label htmlFor="explicacion_es">Por qué importa (español)</label>
        <textarea id="explicacion_es" value={form.explicacion_es} onChange={(e) => setForm({ ...form, explicacion_es: e.target.value })} />
        <label htmlFor="explicacion_en">Por qué importa (inglés)</label>
        <textarea id="explicacion_en" value={form.explicacion_en} onChange={(e) => setForm({ ...form, explicacion_en: e.target.value })} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={form.pideFoto} onChange={(e) => setForm({ ...form, pideFoto: e.target.checked })} style={{ width: 'auto' }} />
          Pide foto de evidencia
        </label>
        {error && <p className="muted" style={{ color: 'var(--cacao)' }}>{error}</p>}
        <div className="stack" style={{ gridTemplateColumns: form.id ? '1fr 1fr' : '1fr', display: 'grid' }}>
          <button className="btn" type="submit" disabled={guardando}>{guardando ? 'Guardando…' : form.id ? 'Guardar cambios' : 'Crear indicador'}</button>
          {form.id && <button className="btn ghost" type="button" onClick={() => setForm(VACIO)}>Cancelar edición</button>}
        </div>
      </form>

      <h2 style={{ marginTop: 28 }}>Catálogo ({lista?.length ?? '…'})</h2>
      <div className="tabla-envoltura">
        <table className="tabla">
          <thead><tr><th>Foto</th><th>Nombre</th><th>Tipo</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {lista?.map((i) => (
              <tr key={i.id}>
                <td>
                  {urlPublica('catalogo', i.foto_path) ? (
                    <img src={urlPublica('catalogo', i.foto_path)} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 20 }}>{i.emoji}</span>
                  )}
                </td>
                <td>{i.nombre_es}</td>
                <td>{i.tipo_medicion}</td>
                <td><span className={i.activo ? 'pill' : 'pill off'}>{i.activo ? 'activo' : 'inactivo'}</span></td>
                <td>
                  <div className="fila-validacion">
                    <button className="pill" type="button" onClick={() => editar(i)}>Editar</button>
                    <label className="pill off" style={{ cursor: 'pointer' }}>
                      Foto
                      <input type="file" accept="image/*" onChange={(e) => subirFoto(i.id, e)} style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} />
                    </label>
                    <button className="pill off" type="button" onClick={() => desactivarIndicador(i.id, !i.activo).then(recargar)}>
                      {i.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
