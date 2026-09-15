import { useState } from 'react'
import { Leaf, ArrowRight } from 'lucide-react'
import { useSesion } from '../lib/sesion.jsx'
import { supabaseListo } from '../lib/supabase.js'
import { cn } from '../lib/utils.js'

// Supabase responde en inglés — traducimos los mensajes más comunes para
// que no le toque adivinar en inglés a quien está probando esto en el celular.
function traducirError(mensaje) {
  const mapa = {
    'Invalid login credentials': 'Correo o contraseña incorrectos.',
    'Email not confirmed': 'Todavía no confirmaste tu correo — revisa tu bandeja de entrada (y spam) y abre el enlace que te mandamos.',
    'User already registered': 'Ya existe una cuenta con ese correo. Prueba "Ya tengo cuenta".',
    'Email rate limit exceeded': 'Se enviaron demasiados correos seguidos — espera unos minutos y vuelve a intentar.',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
  }
  return mapa[mensaje] || mensaje
}

// Pantalla de acceso del guía y del panel. Un solo formulario con dos modos
// (entrar / crear cuenta) — no hay "recuperar contraseña" todavía, para eso
// está el correo de soporte por ahora. Diseño traído del prototipo (hoja de
// campo con acento verde) — la franja de arriba usa el mismo degradado que
// el resto de la app en vez de una foto de internet, para no depender de
// una URL externa en la pantalla que menos tolera fallar.
export default function IniciarSesion({ titulo = 'Acceso del equipo' }) {
  const { entrar, registrar } = useSesion()
  const [modo, setModo] = useState('entrar') // entrar | crear
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [nombre, setNombre] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [creada, setCreada] = useState(false)

  if (!supabaseListo) {
    return (
      <div className="mx-auto w-full max-w-sm">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{titulo}</p>
        <h2 className="mt-1 font-display text-2xl text-ink">Falta conectar Supabase</h2>
        <p className="mt-2 text-ink-soft">Esta pantalla necesita el archivo .env con las claves del proyecto en Supabase.</p>
      </div>
    )
  }

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      if (modo === 'entrar') {
        await entrar(correo, clave)
      } else {
        await registrar(correo, clave, nombre)
        setCreada(true)
      }
    } catch (err) {
      setError(traducirError(err.message))
    } finally {
      setCargando(false)
    }
  }

  const cabecera = (
    <div className="relative flex h-28 items-end overflow-hidden rounded-2xl bg-gradient-to-br from-leaf to-leaf-deep p-5 shadow-[var(--shadow-leaf)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(255,255,255,0.25),transparent_60%)]" />
      <span className="grid size-10 place-items-center rounded-xl bg-white/15 text-primary-foreground backdrop-blur-sm">
        <Leaf className="size-5" />
      </span>
    </div>
  )

  if (creada) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
        {cabecera}
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{titulo}</p>
          <h2 className="mt-1 font-display text-2xl text-ink">Revisa tu correo</h2>
        </div>
        <p className="text-ink-soft">
          Te mandamos un enlace de confirmación a <b className="text-ink">{correo}</b>. Ábrelo desde el mismo celular o
          computador (puede tardar uno o dos minutos, y a veces cae en spam) — hasta que lo confirmes, Supabase no te
          deja entrar todavía.
        </p>
        <p className="text-ink-soft">
          Una vez confirmado: si ya te habían invitado con este correo, entras directo. Si no, avísale al
          administrador de la finca para que te active desde el panel.
        </p>
        <button
          type="button"
          onClick={() => { setCreada(false); setModo('entrar') }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-leaf px-5 py-3.5 font-display font-semibold text-primary-foreground shadow-[var(--shadow-leaf)] transition-colors hover:bg-leaf-deep"
        >
          Ya confirmé, entrar <ArrowRight className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      {cabecera}

      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{titulo}</p>
        <h1 className="mt-1 font-display text-3xl text-ink">{modo === 'entrar' ? 'Hola de nuevo' : 'Crear cuenta'}</h1>
        <p className="mt-2 text-ink-soft">
          {modo === 'entrar' ? 'Entra con tu correo de la finca.' : 'Regístrate con el correo que te invitaron (o el tuyo, si vas a ser el primer administrador).'}
        </p>
      </div>

      <form onSubmit={enviar} className="flex flex-col gap-4">
        {modo === 'crear' && (
          <div>
            <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-ink">Nombre</label>
            <input
              id="nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required
              className="w-full rounded-md border border-line bg-surface px-4 py-3 text-ink outline-none focus:border-leaf"
            />
          </div>
        )}
        <div>
          <label htmlFor="correo" className="mb-1.5 block text-sm font-medium text-ink">Correo</label>
          <input
            id="correo" type="email" autoComplete="username" value={correo} onChange={(e) => setCorreo(e.target.value)} required
            className="w-full rounded-md border border-line bg-surface px-4 py-3 text-ink outline-none focus:border-leaf"
          />
        </div>
        <div>
          <label htmlFor="clave" className="mb-1.5 block text-sm font-medium text-ink">Contraseña</label>
          <input
            id="clave" type="password" autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
            value={clave} onChange={(e) => setClave(e.target.value)} required minLength={6}
            className="w-full rounded-md border border-line bg-surface px-4 py-3 text-ink outline-none focus:border-leaf"
          />
        </div>

        {error && <p className="rounded-md border border-cacao-soft bg-cacao-soft/40 px-3 py-2 text-sm text-cacao">{error}</p>}

        <button
          type="submit" disabled={cargando}
          className={cn(
            'mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-leaf px-5 py-3.5 font-display font-semibold text-primary-foreground shadow-[var(--shadow-leaf)] transition-colors hover:bg-leaf-deep',
            cargando && 'opacity-60',
          )}
        >
          {cargando ? 'Un momento…' : modo === 'entrar' ? 'Entrar' : 'Crear cuenta'}
          {!cargando && <ArrowRight className="size-4" />}
        </button>
        <button
          type="button"
          onClick={() => { setModo(modo === 'entrar' ? 'crear' : 'entrar'); setError('') }}
          className="text-center text-sm text-muted-foreground transition-colors hover:text-leaf"
        >
          {modo === 'entrar' ? 'Todavía no tengo cuenta' : 'Ya tengo cuenta'}
        </button>
      </form>
    </div>
  )
}
