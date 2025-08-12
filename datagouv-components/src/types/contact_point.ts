export type ContactType = { id: string, label: string }

export type ContactPoint = {
  id: string
  name: string
  contact_form?: string
  email?: string
  role: 'contact' | 'creator' | 'publisher'
}
