export type BaseQuestion = {
  id: string
  label?: string
  title?: string
}

export type QuestionWithChoices = BaseQuestion & {
  choices: Array<Question>
}

export type QuestionWithAnswer = BaseQuestion & ({ answer: string } | {
  answer: string
  button_link: string
  button_text: string
})

export type QuestionWithSegment = BaseQuestion & {
  segment: string
}

export type Question = QuestionWithChoices | QuestionWithAnswer | QuestionWithSegment
