import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase.js'

const SesionContext = createContext(null)

// Sesión de la app del guía y del panel (Supabase Auth, correo + contraseña).
// El visitante NO usa esto — su "identidad" es solo el nombre que escribe.
//
// Quién es quién: la primera persona que se registra en un proyecto de
// Supabase vacío queda como admin automáticamente (trigger `al_crear_usuario`
// en supabase/schema.sql). Las siguientes necesitan que el admin las invite
// primero desde el panel (Usuarios); si se registran sin invitación, su
// perfil queda creado pero inactivo y no entran a ningún lado hasta que el
// admin las active.
export function SesionProvider({ children }) {
  const [cargando, setCargando] = useState(true)
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)

  async function cargarPerfil(usuarioId) {
    if (!supabase || !usuarioId) {
      setPerfil(null)
      return
    }
    const { data } = await supabase.from('perfiles').select('*').eq('id', usuarioId).maybeSingle()
    setPerfil(data ?? null)
  }

  useEffect(() => {
    if (!supabase) {
      setCargando(false)
      return
    }
    let activo = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!activo) return
      setUsuario(data.session?.user ?? null)
      await cargarPerfil(data.session?.user?.id)
      if (activo) setCargando(false)
    })
    const { data: suscripcion } = supabase.auth.onAuthStateChange((_evento, session) => {
      setUsuario(session?.user ?? null)
      cargarPerfil(session?.user?.id)
    })
    return () => {
      activo = false
      suscripcion.subscription.unsubscribe()
    }
  }, [])

  async function entrar(correo, clave) {
    const { error } = await supabase.auth.signInWithPassword({ email: correo, password: clave })
    if (error) throw error
  }

  async function registrar(correo, clave, nombre) {
    const { error } = await supabase.auth.signUp({ email: correo, password: clave, options: { data: { nombre } } })
    if (error) throw error
  }

  async function salir() {
    await supabase.auth.signOut()
  }

  const valor = { cargando, usuario, perfil, entrar, registrar, salir }
  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
}

export function useSesion() {
  const ctx = useContext(SesionContext)
  if (!ctx) throw new Error('useSesion() se usa dentro de <SesionProvider>')
  return ctx
}
