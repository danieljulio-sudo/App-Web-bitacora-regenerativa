import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import { listarPreguntas, guardarPregunta, desactivarPregunta } from '../../lib/admin.js'
import { campoInput, campoLabel, tarjeta, botonPrimario, botonSecundario, chip } from '../../lib/estilosFormulario.js'
import { cn } from '../../lib/utils.js'

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
    <div className="flex flex-col gap-6">
      <div className={tarjeta}>
        <h2 className="font-display text-lg text-ink">{form.id ? 'Editar pregunta' : 'Nueva pregunta de cierre'}</h2>
        <form onSubmit={guardar} className="mt-1 grid gap-x-5 sm:grid-cols-2">
          <div>
            <label htmlFor="porden" className={campoLabel}>Orden</label>
            <input id="porden" type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })} className={campoInput} />
          </div>
          <div>
            <label htmlFor="ptipo" className={campoLabel}>Tipo</label>
            <select id="ptipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className={campoInput}>
              <option value="escala">Escala 1 a 5</option>
              <option value="texto">Texto libre</option>
            </select>
          </div>
          <div>
            <label htmlFor="ptexto_es" className={campoLabel}>Pregunta (español)</label>
            <input id="ptexto_es" required value={form.texto_es} onChange={(e) => setForm({ ...form, texto_es: e.target.value })} className={campoInput} />
          </div>
          <div>
            <label htmlFor="ptexto_en" className={campoLabel}>Pregunta (inglés)</label>
            <input id="ptexto_en" value={form.texto_en} onChange={(e) => setForm({ ...form, texto_en: e.target.value })} className={campoInput} />
          </div>
          {form.tipo === 'escala' && (
            <>
              <div>
                <label htmlFor="pmin" className={campoLabel}>Etiqueta del extremo bajo (ej. "Nada nuevo")</label>
                <input id="pmin" value={form.minimo_es} onChange={(e) => setForm({ ...form, minimo_es: e.target.value })} className={campoInput} />
              </div>
              <div>
                <label htmlFor="pmax" className={campoLabel}>Etiqueta del extremo alto (ej. "Muchísimo")</label>
                <input id="pmax" value={form.maximo_es} onChange={(e) => setForm({ ...form, maximo_es: e.target.value })} className={campoInput} />
              </div>
            </>
          )}
          <div className="mt-4 flex gap-3 sm:col-span-2">
            <button type="submit" className={botonPrimario}>{form.id ? 'Guardar cambios' : 'Agregar pregunta'}</button>
            {form.id && <button type="button" onClick={() => setForm(VACIA)} className={botonSecundario}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div>
        <h2 className="font-display text-lg text-ink">Preguntas del cierre</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-line">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5">#</th><th className="px-4 py-2.5">Pregunta</th><th className="px-4 py-2.5">Tipo</th><th className="px-4 py-2.5">Estado</th><th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {lista?.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0 hover:bg-leaf-soft/40">
                  <td className="px-4 py-2.5 text-muted-foreground">{p.orden}</td>
                  <td className="px-4 py-2.5 text-ink">{p.texto_es}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.tipo}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn(chip, p.activa ? 'bg-leaf-soft text-leaf-deep' : 'bg-muted text-muted-foreground')}>{p.activa ? 'activa' : 'inactiva'}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => editar(p)} className={cn(chip, 'bg-leaf-soft text-leaf-deep')}><Pencil className="size-3" /> Editar</button>
                      <button type="button" onClick={() => desactivarPregunta(p.id, !p.activa).then(recargar)} className={cn(chip, 'bg-muted text-muted-foreground')}>
                        {p.activa ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
