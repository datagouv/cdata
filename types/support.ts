export type BaseQuestion = {
  id: string
  label?: string
  title: string
}

export type QuestionWithChoices = BaseQuestion & {
  choices: Array<Question>
}

export type QuestionWithAnswer = BaseQuestion & {
  answer: string
}

export type QuestionWithRecipient = BaseQuestion & {
  recipient: string
}

export type Question = QuestionWithChoices | QuestionWithAnswer | QuestionWithRecipient
