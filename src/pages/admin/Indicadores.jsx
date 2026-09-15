import { useEffect, useState } from 'react'
import { Camera, Pencil } from 'lucide-react'
import { listarIndicadores, guardarIndicador, desactivarIndicador, subirFotoIndicador } from '../../lib/admin.js'
import { comprimirFoto } from '../../lib/foto.js'
import { urlPublica } from '../../lib/supabase.js'
import { campoInput, campoLabel, tarjeta, botonPrimario, botonSecundario, chip } from '../../lib/estilosFormulario.js'
import { cn } from '../../lib/utils.js'

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
    <div className="flex flex-col gap-6">
      <div className={tarjeta}>
        <h2 className="font-display text-lg text-ink">{form.id ? 'Editar indicador' : 'Nuevo indicador'}</h2>
        <form onSubmit={guardar} className="mt-1 grid gap-x-5 sm:grid-cols-2">
          <div>
            <label htmlFor="nombre_es" className={campoLabel}>Nombre (español)</label>
            <input id="nombre_es" required value={form.nombre_es} onChange={(e) => setForm({ ...form, nombre_es: e.target.value })} className={campoInput} />
          </div>
          <div>
            <label htmlFor="nombre_en" className={campoLabel}>Nombre (inglés)</label>
            <input id="nombre_en" value={form.nombre_en} onChange={(e) => setForm({ ...form, nombre_en: e.target.value })} className={campoInput} />
          </div>
          <div>
            <label htmlFor="cientifico" className={campoLabel}>Nombre científico (opcional)</label>
            <input id="cientifico" value={form.nombreCientifico} onChange={(e) => setForm({ ...form, nombreCientifico: e.target.value })} className={campoInput} />
          </div>
          <div>
            <label htmlFor="categoria" className={campoLabel}>Categoría</label>
            <input id="categoria" placeholder="suelo, biodiversidad, agua, planta…" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className={campoInput} />
          </div>
          <div>
            <label htmlFor="tipo" className={campoLabel}>Tipo de medición</label>
            <select id="tipo" value={form.tipoMedicion} onChange={(e) => setForm({ ...form, tipoMedicion: e.target.value })} className={campoInput}>
              <option value="conteo">Conteo (¿cuántos viste?)</option>
              <option value="si_no">Sí / no</option>
              <option value="escala">Escala 1 a 5</option>
              <option value="foto">Solo foto de evidencia</option>
            </select>
          </div>
          <div>
            <label htmlFor="emoji" className={campoLabel}>Emoji (mientras no haya foto)</label>
            <input id="emoji" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} className={campoInput} />
          </div>
          <div>
            <label htmlFor="pista_es" className={campoLabel}>Pista, dónde buscarlo (español)</label>
            <input id="pista_es" value={form.pista_es} onChange={(e) => setForm({ ...form, pista_es: e.target.value })} className={campoInput} />
          </div>
          <div>
            <label htmlFor="pista_en" className={campoLabel}>Pista (inglés)</label>
            <input id="pista_en" value={form.pista_en} onChange={(e) => setForm({ ...form, pista_en: e.target.value })} className={campoInput} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="explicacion_es" className={campoLabel}>Por qué importa (español)</label>
            <textarea id="explicacion_es" rows={3} value={form.explicacion_es} onChange={(e) => setForm({ ...form, explicacion_es: e.target.value })} className={cn(campoInput, 'resize-none')} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="explicacion_en" className={campoLabel}>Por qué importa (inglés)</label>
            <textarea id="explicacion_en" rows={3} value={form.explicacion_en} onChange={(e) => setForm({ ...form, explicacion_en: e.target.value })} className={cn(campoInput, 'resize-none')} />
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm text-ink sm:col-span-2">
            <input type="checkbox" checked={form.pideFoto} onChange={(e) => setForm({ ...form, pideFoto: e.target.checked })} className="size-4 accent-leaf" />
            Pide foto de evidencia
          </label>
          {error && <p className="mt-3 rounded-md border border-cacao-soft bg-cacao-soft/40 px-3 py-2 text-sm text-cacao sm:col-span-2">{error}</p>}
          <div className="mt-4 flex gap-3 sm:col-span-2">
            <button type="submit" disabled={guardando} className={botonPrimario}>{guardando ? 'Guardando…' : form.id ? 'Guardar cambios' : 'Crear indicador'}</button>
            {form.id && <button type="button" onClick={() => setForm(VACIO)} className={botonSecundario}>Cancelar edición</button>}
          </div>
        </form>
      </div>

      <div>
        <h2 className="font-display text-lg text-ink">Catálogo ({lista?.length ?? '…'})</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-line">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5">Foto</th><th className="px-4 py-2.5">Nombre</th><th className="px-4 py-2.5">Tipo</th><th className="px-4 py-2.5">Estado</th><th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {lista?.map((i) => (
                <tr key={i.id} className="border-b border-line last:border-0 hover:bg-leaf-soft/40">
                  <td className="px-4 py-2.5">
                    {urlPublica('catalogo', i.foto_path) ? (
                      <img src={urlPublica('catalogo', i.foto_path)} alt="" className="size-9 rounded-md object-cover" />
                    ) : (
                      <span className="text-xl">{i.emoji}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-ink">{i.nombre_es}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{i.tipo_medicion}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn(chip, i.activo ? 'bg-leaf-soft text-leaf-deep' : 'bg-muted text-muted-foreground')}>{i.activo ? 'activo' : 'inactivo'}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => editar(i)} className={cn(chip, 'bg-leaf-soft text-leaf-deep')}><Pencil className="size-3" /> Editar</button>
                      <label className={cn(chip, 'relative cursor-pointer bg-muted text-muted-foreground')}>
                        <Camera className="size-3" /> Foto
                        <input type="file" accept="image/*" onChange={(e) => subirFoto(i.id, e)} className="absolute inset-0 size-full cursor-pointer opacity-0" />
                      </label>
                      <button type="button" onClick={() => desactivarIndicador(i.id, !i.activo).then(recargar)} className={cn(chip, 'bg-muted text-muted-foreground')}>
                        {i.activo ? 'Desactivar' : 'Activar'}
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
