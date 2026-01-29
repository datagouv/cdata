export type MarkdownEditorProps = {
  ariaLabel?: string
  ariaLabelledBy?: string
  id: string
  disabled?: boolean
  headingLevels?: 1 | 2 | 3 | 4
  minHeading?: 1 | 2 | 3 | 4 | 5
  value: string | undefined
}
