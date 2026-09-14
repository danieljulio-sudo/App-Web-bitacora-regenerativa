import { useEffect, useState } from 'react'
import { listarPreguntas, guardarPregunta, desactivarPregunta } from '../../lib/admin.js'

const VACIA = { id: null, orden: 0, texto_es: '', texto_en: '', tipo: 'escala', minimo_es: '', minimo_en: '', maximo_es: '', maximo_en: '' }

// RF-06: 3 a 4 preguntas de percepción para el cierre del recorrido,
// definidas por la finca — el visitante las ve en el orden de aquí.
export default function Preguntas() {
  const [lista, setLista] = useState(null)
  const [form, setForm] = useState(VACIA)

  async function recargar() {
    setLista(await listarPreguntas())
  }
  useEffect(() => { recargar() }, [])

  async function guardar(e) {
    e.preventDefault()
    await guardarPregunta(form)
    setForm(VACIA)
    await recargar()
  }

  function editar(p) {
    setForm({
      id: p.id, orden: p.orden, texto_es: p.texto_es, texto_en: p.texto_en || '', tipo: p.tipo,
      minimo_es: p.minimo_es || '', minimo_en: p.minimo_en || '', maximo_es: p.maximo_es || '', maximo_en: p.maximo_en || '',
    })
  }

  return (
    <>
      <h2>{form.id ? 'Editar pregunta' : 'Nueva pregunta de cierre'}</h2>
      <form onSubmit={guardar}>
        <label htmlFor="porden">Orden</label>
        <input id="porden" type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })} />
        <label htmlFor="ptexto_es">Pregunta (español)</label>
        <input id="ptexto_es" required value={form.texto_es} onChange={(e) => setForm({ ...form, texto_es: e.target.value })} />
        <label htmlFor="ptexto_en">Pregunta (inglés)</label>
        <input id="ptexto_en" value={form.texto_en} onChange={(e) => setForm({ ...form, texto_en: e.target.value })} />
        <label htmlFor="ptipo">Tipo</label>
        <select id="ptipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
          <option value="escala">Escala 1 a 5</option>
          <option value="texto">Texto libre</option>
        </select>
        {form.tipo === 'escala' && (
          <>
            <label htmlFor="pmin">Etiqueta del extremo bajo (ej. "Nada nuevo")</label>
            <input id="pmin" value={form.minimo_es} onChange={(e) => setForm({ ...form, minimo_es: e.target.value })} />
            <label htmlFor="pmax">Etiqueta del extremo alto (ej. "Muchísimo")</label>
            <input id="pmax" value={form.maximo_es} onChange={(e) => setForm({ ...form, maximo_es: e.target.value })} />
          </>
        )}
        <div className="stack" style={{ display: 'grid', gridTemplateColumns: form.id ? '1fr 1fr' : '1fr' }}>
          <button className="btn" type="submit">{form.id ? 'Guardar cambios' : 'Agregar pregunta'}</button>
          {form.id && <button className="btn ghost" type="button" onClick={() => setForm(VACIA)}>Cancelar</button>}
        </div>
      </form>

      <h2 style={{ marginTop: 28 }}>Preguntas del cierre</h2>
      <div className="tabla-envoltura">
        <table className="tabla">
          <thead><tr><th>#</th><th>Pregunta</th><th>Tipo</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {lista?.map((p) => (
              <tr key={p.id}>
                <td>{p.orden}</td>
                <td>{p.texto_es}</td>
                <td>{p.tipo}</td>
                <td><span className={p.activa ? 'pill' : 'pill off'}>{p.activa ? 'activa' : 'inactiva'}</span></td>
                <td>
                  <div className="fila-validacion">
                    <button className="pill" type="button" onClick={() => editar(p)}>Editar</button>
                    <button className="pill off" type="button" onClick={() => desactivarPregunta(p.id, !p.activa).then(recargar)}>{p.activa ? 'Desactivar' : 'Activar'}</button>
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
