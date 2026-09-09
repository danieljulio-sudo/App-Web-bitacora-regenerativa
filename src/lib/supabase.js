import { createClient } from '@supabase/supabase-js'

// Las dos claves viven en un archivo .env que NO se sube al repositorio.
// La "anon key" es pública por diseño: solo permite lo que las reglas de Supabase autoricen.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && key ? createClient(url, key) : null
export const supabaseListo = Boolean(supabase)
