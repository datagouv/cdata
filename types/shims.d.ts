declare module '~/assets/config/support.toml' {
  import type { Question } from '~/types/support'

  export const id: string
  export const title: string
  export const choices: Array<Question>
}
