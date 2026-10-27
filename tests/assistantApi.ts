import { randomUUID } from 'node:crypto'

export const ASSISTANT_CHAT_PATH = '/api/1/assistant/chat/'

const SQL_QUERY = 'SELECT nom_region, nb_logements FROM logements ORDER BY nb_logements DESC'

export function assistantChatStream(): string {
  const textId = 'assistant-text'
  const chunks = [
    { type: 'start', messageId: randomUUID() },
    { type: 'text-start', id: textId },
    { type: 'text-delta', id: textId, delta: 'Voici une requête SQL possible :\n\n```sql\n' },
    { type: 'text-delta', id: textId, delta: SQL_QUERY },
    { type: 'text-delta', id: textId, delta: '\n```' },
    { type: 'text-end', id: textId },
    { type: 'finish', finishReason: 'stop' },
  ]

  return `${chunks.map(chunk => `data: ${JSON.stringify(chunk)}\n\n`).join('')}data: [DONE]\n\n`
}
