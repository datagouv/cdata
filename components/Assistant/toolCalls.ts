import { isRecord } from '@datagouv/components-next'

export type ToolCallStatus = 'running' | 'succeeded' | 'failed'

export type ToolCall = {
  type: string
  status: ToolCallStatus
  input: unknown
  output: unknown
  // The raw part, for the trace which reads fields this model leaves out.
  part: Record<string, unknown>
}

function isToolPart(part: unknown): part is Record<string, unknown> & { type: string } {
  return isRecord(part) && typeof part.type === 'string' && part.type.startsWith('tool-')
}

function toolStatus(part: Record<string, unknown>): ToolCallStatus {
  if (part.state === 'output-error' || part.state === 'output-denied') return 'failed'
  if (part.state !== 'output-available') return 'running'
  // A tool refusal (bad column, step budget) comes back as a successful part carrying `status: "error"`.
  return isRecord(part.output) && part.output.status === 'error' ? 'failed' : 'succeeded'
}

export function toolCalls(parts: unknown[]): ToolCall[] {
  return parts.filter(isToolPart).map(part => ({
    type: part.type,
    status: toolStatus(part),
    input: part.input,
    output: part.output,
    part,
  }))
}

// A failure the model recovered from, with the same tool, is noise: only unrecovered ones stay visible.
export function displayedToolCalls(calls: ToolCall[]): ToolCall[] {
  return calls.filter((call, index) =>
    call.status !== 'failed'
    || !calls.slice(index + 1).some(later => later.type === call.type && later.status === 'succeeded'),
  )
}

// Text written before the last tool call is the model announcing its plan, not the answer.
export function hasAnswerText(parts: unknown[]): boolean {
  const lastToolIndex = parts.findLastIndex(isToolPart)
  return parts.slice(lastToolIndex + 1).some(part =>
    isRecord(part) && part.type === 'text' && typeof part.text === 'string' && part.text.trim() !== '',
  )
}
