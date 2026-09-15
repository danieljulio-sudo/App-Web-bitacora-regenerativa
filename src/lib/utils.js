import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Junta clases de Tailwind condicionales sin que se pisen entre sí
// (ej. "px-4 px-6" → se queda con "px-6"). Traído del prototipo de diseño.
export function cn(...entradas) {
  return twMerge(clsx(entradas))
}
