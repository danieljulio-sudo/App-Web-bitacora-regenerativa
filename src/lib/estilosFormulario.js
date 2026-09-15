// Clases de Tailwind repetidas en los formularios del panel de la finca —
// no hay prototipo de diseño para estas pantallas (ver PLAN-FASE1.md), así
// que esto es lo que las mantiene consistentes entre Indicadores, Rutas,
// Preguntas, Recorridos y Usuarios sin retipear la misma cadena larga en
// cada campo.
export const campoInput = 'w-full rounded-md border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-leaf'
export const campoLabel = 'mb-1.5 mt-3.5 block text-sm font-medium text-ink'
export const tarjeta = 'rounded-xl border border-line bg-surface p-5 shadow-[0_1px_0_rgba(36,33,28,0.04)]'
export const botonPrimario = 'rounded-xl bg-leaf px-5 py-2.5 text-sm font-display font-semibold text-primary-foreground shadow-[var(--shadow-leaf)] transition-colors hover:bg-leaf-deep disabled:opacity-40'
export const botonSecundario = 'rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-leaf/40'
export const chip = 'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors'
