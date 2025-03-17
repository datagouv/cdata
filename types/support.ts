export type Question = {
  id: string
  label?: string
  title: string
  choices: Array<Question>
}
