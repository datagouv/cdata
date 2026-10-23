/**
 * Extract the content of the last fenced ```sql block of a text, or null.
 * The fence language is matched case-insensitively.
 */
export function extractLastSqlBlock(text: string): string | null {
  const matches = [...text.matchAll(/```sql\s*\r?\n([\s\S]*?)```/gi)]
  if (matches.length === 0) return null
  return matches[matches.length - 1][1].trim()
}

/**
 * Build the assistant chat request body. The optional `resource_id` context
 * is only sent when a resource is selected.
 */
export function buildChatBody(messages: unknown[], resourceId: string | null): { messages: unknown[], resource_id?: string } {
  return {
    messages,
    ...(resourceId ? { resource_id: resourceId } : {}),
  }
}

/**
 * Map an error surfaced by useChat to a French user-facing message.
 * HTTP failures carry a `statusCode` (APICallError from the transport);
 * anything else is treated as a network/unknown failure.
 */
export function mapAssistantError(error: unknown): string {
  const statusCode = (error as { statusCode?: unknown } | null)?.statusCode
  if (statusCode === 401) return 'Veuillez vous reconnecter pour utiliser l’assistant.'
  if (statusCode === 429) return 'Quota journalier dépassé, réessayez demain.'
  if (statusCode === 503) return 'Assistant non configuré pour le moment.'
  return 'Une erreur est survenue, veuillez réessayer.'
}
