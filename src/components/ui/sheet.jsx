import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils.js'

// Hoja deslizante desde abajo (para "Crear recorrido" en la app del guía).
// Versión chica del Sheet de shadcn/ui — solo la variante "bottom" que
// usa el prototipo, construida sobre @radix-ui/react-dialog para heredar
// gratis el manejo de foco, Escape y overlay accesible.
export function Sheet({ children, ...props }) {
  return <Dialog.Root {...props}>{children}</Dialog.Root>
}
export const SheetTrigger = Dialog.Trigger

export function SheetContent({ children, className }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
      <Dialog.Content
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-line bg-surface p-5 pb-8 shadow-[var(--shadow)]',
          'data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom',
          'mx-auto w-full max-w-[30rem]',
          className,
        )}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line" />
        {children}
        <Dialog.Close className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-ink" aria-label="Cerrar">
          <X className="size-4" />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  )
}

export function SheetHeader({ children }) {
  return <div className="mb-4">{children}</div>
}
export function SheetTitle({ children }) {
  return <Dialog.Title className="font-display text-lg font-semibold text-ink">{children}</Dialog.Title>
}
export function SheetDescription({ children }) {
  return <Dialog.Description className="mt-1 text-sm text-muted-foreground">{children}</Dialog.Description>
}
