import { useState } from 'react'
import { useSesion } from '../lib/sesion.jsx'
import { supabaseListo } from '../lib/supabase.js'

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
// está el correo de soporte por ahora.
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
      <>
        <p className="eyebrow">{titulo}</p>
        <h2>Falta conectar Supabase</h2>
        <p>Esta pantalla necesita el archivo .env con las claves del proyecto en Supabase.</p>
      </>
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

  if (creada) {
    return (
      <>
        <p className="eyebrow">{titulo}</p>
        <h2>Revisa tu correo</h2>
        <p>
          Te mandamos un enlace de confirmación a <b>{correo}</b>. Ábrelo desde el mismo celular o
          computador (puede tardar uno o dos minutos, y a veces cae en spam) — hasta que lo confirmes,
          Supabase no te deja entrar todavía.
        </p>
        <p>
          Una vez confirmado: si ya te habían invitado con este correo, entras directo. Si no, avísale
          al administrador de la finca para que te active desde el panel.
        </p>
        <div className="stack">
          <button className="btn" type="button" onClick={() => { setCreada(false); setModo('entrar') }}>Ya confirmé, entrar</button>
        </div>
      </>
    )
  }

  return (
    <>
      <p className="eyebrow">{titulo}</p>
      <h2>{modo === 'entrar' ? 'Entrar' : 'Crear cuenta'}</h2>
      <form onSubmit={enviar}>
        {modo === 'crear' && (
          <>
            <label htmlFor="nombre">Nombre</label>
            <input id="nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </>
        )}
        <label htmlFor="correo">Correo</label>
        <input id="correo" type="email" autoComplete="username" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        <label htmlFor="clave">Contraseña</label>
        <input id="clave" type="password" autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'} value={clave} onChange={(e) => setClave(e.target.value)} required minLength={6} />
        {error && <p className="muted" style={{ color: 'var(--cacao)' }}>{error}</p>}
        <div className="stack">
          <button className="btn" type="submit" disabled={cargando}>
            {cargando ? 'Un momento…' : modo === 'entrar' ? 'Entrar' : 'Crear cuenta'}
          </button>
          <button className="btn ghost" type="button" onClick={() => { setModo(modo === 'entrar' ? 'crear' : 'entrar'); setError('') }}>
            {modo === 'entrar' ? 'Todavía no tengo cuenta' : 'Ya tengo cuenta'}
          </button>
        </div>
      </form>
    </>
  )
}
