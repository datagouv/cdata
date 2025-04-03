export type AccordionRegister = {
  withIcon: boolean
  isOpen(id: string): boolean
  toggle: (id: string) => void
  open: (id: string) => void
  unregister: (id: string) => void
}
export const key = Symbol() as InjectionKey<AccordionRegister>
