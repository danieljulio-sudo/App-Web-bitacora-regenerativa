import { useState } from 'react'
import { Leaf, ArrowRight, Mail, Lock, User } from 'lucide-react'
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

// Campo de texto con icono a la izquierda. El borde va sobre --paper (más
// oscuro que la tarjeta en --surface) para que se note incluso en pantallas
// comprimidas o con poco contraste — la queja original era "no se ve el
// cuadro del input", así que aquí el contraste es la prioridad, no solo el gusto.
function Campo({ icono: Icono, label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <span className="relative flex items-center">
        <Icono className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
        <input
          {...props}
          className="w-full rounded-xl border border-line bg-background py-3 pl-10 pr-3.5 text-ink outline-none transition-colors focus:border-leaf focus:ring-2 focus:ring-leaf/20"
        />
      </span>
    </label>
  )
}

// Pantalla de acceso del guía y del panel. Un solo formulario con dos modos
// (entrar / crear cuenta), presentados como un interruptor tipo "segmented
// control" arriba de la tarjeta en vez de un link discreto al final — así
// se nota de una que hay dos caminos. Diseño traído del prototipo (hoja de
// campo con acento verde): franja superior con el mismo degradado del resto
// de la app en vez de una foto de internet, para no depender de una URL
// externa en la pantalla que menos tolera fallar.
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
      <div className="mx-auto w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow)]">
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

  const botonBase = cn(
    'flex w-full items-center justify-center gap-2 rounded-xl bg-leaf px-5 py-3.5 font-display font-semibold text-primary-foreground shadow-[var(--shadow-leaf)] transition-[background-color,transform] duration-150 ease-out hover:bg-leaf-deep active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100',
  )

  const cabecera = (
    <div className="relative flex h-24 items-end overflow-hidden rounded-2xl bg-gradient-to-br from-leaf to-leaf-deep p-5 shadow-[var(--shadow-leaf)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-20%,rgba(255,255,255,0.28),transparent_60%)]" />
      <span className="grid size-11 place-items-center rounded-xl bg-white/15 text-primary-foreground ring-1 ring-white/20 backdrop-blur-sm">
        <Leaf className="size-5" />
      </span>
    </div>
  )

  if (creada) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col gap-5">
        {cabecera}
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow)]">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{titulo}</p>
          <h2 className="mt-1 font-display text-2xl text-ink">Revisa tu correo</h2>
          <p className="mt-3 text-ink-soft">
            Te mandamos un enlace de confirmación a <b className="text-ink">{correo}</b>. Ábrelo desde el mismo celular
            o computador (puede tardar uno o dos minutos, y a veces cae en spam) — hasta que lo confirmes, Supabase no
            te deja entrar todavía.
          </p>
          <p className="mt-3 text-ink-soft">
            Una vez confirmado: si ya te habían invitado con este correo, entras directo. Si no, avísale al
            administrador de la finca para que te active desde el panel.
          </p>
          <button
            type="button"
            onClick={() => { setCreada(false); setModo('entrar') }}
            className={cn(botonBase, 'mt-5')}
          >
            Ya confirmé, entrar <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5">
      {cabecera}

      <div className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow)]">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{titulo}</p>
        <h1 className="mt-1 font-display text-2xl text-ink sm:text-3xl">{modo === 'entrar' ? 'Hola de nuevo' : 'Crear cuenta'}</h1>
        <p className="mt-2 text-ink-soft">
          {modo === 'entrar' ? 'Entra con tu correo de la finca.' : 'Regístrate con el correo que te invitaron (o el tuyo, si vas a ser el primer administrador).'}
        </p>

        {/* Interruptor entrar/crear — reemplaza el link al final, para que
            los dos caminos se vean desde el principio, no como algo escondido. */}
        <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-background p-1">
          {[{ v: 'entrar', t: 'Entrar' }, { v: 'crear', t: 'Crear cuenta' }].map((op) => (
            <button
              key={op.v} type="button"
              onClick={() => { setModo(op.v); setError('') }}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
                modo === op.v ? 'bg-surface text-ink shadow-[var(--shadow-sm)]' : 'text-muted-foreground hover:text-ink',
              )}
            >
              {op.t}
            </button>
          ))}
        </div>

        <form onSubmit={enviar} className="mt-5 flex flex-col gap-4">
          {modo === 'crear' && (
            <Campo icono={User} label="Nombre" id="nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          )}
          <Campo icono={Mail} label="Correo" id="correo" type="email" autoComplete="username" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
          <Campo
            icono={Lock} label="Contraseña" id="clave" type="password"
            autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
            value={clave} onChange={(e) => setClave(e.target.value)} required minLength={6}
          />

          {error && <p className="rounded-xl border border-cacao-soft bg-cacao-soft/40 px-3.5 py-2.5 text-sm text-cacao">{error}</p>}

          <button type="submit" disabled={cargando} className={cn(botonBase, 'mt-1', cargando && 'opacity-60')}>
            {cargando ? 'Un momento…' : modo === 'entrar' ? 'Entrar' : 'Crear cuenta'}
            {!cargando && <ArrowRight className="size-4" />}
          </button>
        </form>
      </div>
    </div>
  )
}
