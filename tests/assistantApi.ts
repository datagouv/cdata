import type { Page } from '@playwright/test'
import { randomUUID } from 'node:crypto'

export const ASSISTANT_CHAT_PATH = '/api/1/assistant/chat/'

/** Fields of the chat request body the fake assistant reads. */
export type AssistantChatBody = {
  resource_id?: string | null
  messages?: Array<{ role?: string }>
}

type Chunk = Record<string, unknown>

/** `create_chart` output: departments by max `n_cum_dose1`, top 5. */
export function createChartOutput(resourceId: string) {
  return {
    status: 'ok',
    chart: {
      title: 'Premières doses par département',
      description: 'Les 5 départements ayant le plus de premières doses cumulées.',
      x_axis: { column_x: 'dep', type: 'discrete', sort_x_by: 'axis_y', sort_x_direction: 'desc', limit: 5 },
      y_axis: { label: null, unit: null, unit_position: 'suffix', min: null, max: null },
      series: [{
        type: 'histogram',
        column_y: 'n_cum_dose1',
        aggregate_y: 'max',
        resource_id: resourceId,
        column_x_name_override: null,
        filters: null,
      }],
    },
    more_groups: false,
  }
}

export const UPDATE_CHART_OUTPUT = { status: 'ok', patch: { y_axis: { unit: 'doses' } } }

function toolCallChunks(toolName: string, input: unknown, output: unknown, text: string): Array<Chunk> {
  const toolCallId = `call-${randomUUID()}`
  const textId = `text-${randomUUID()}`
  return [
    { type: 'start', messageId: randomUUID() },
    { type: 'start-step' },
    { type: 'tool-input-available', toolCallId, toolName, input },
    { type: 'tool-output-available', toolCallId, output },
    { type: 'finish-step' },
    { type: 'start-step' },
    { type: 'text-start', id: textId },
    { type: 'text-delta', id: textId, delta: text },
    { type: 'text-end', id: textId },
    { type: 'finish-step' },
    { type: 'finish', finishReason: 'stop' },
  ]
}

function toStream(chunks: Array<Chunk>): string {
  return `${chunks.map(chunk => `data: ${JSON.stringify(chunk)}\n\n`).join('')}data: [DONE]\n\n`
}

/** A Vercel AI UI message stream answering with one `create_chart` call for `resourceId`. */
export function createChartStream(resourceId: string, output: ReturnType<typeof createChartOutput> = createChartOutput(resourceId)): string {
  return toStream(toolCallChunks('create_chart', { config: output.chart }, output, 'Graphique créé.'))
}

/** A Vercel AI UI message stream answering with one `update_chart` call setting the Y unit. */
export function updateChartStream(): string {
  return toStream(toolCallChunks('update_chart', { patch: UPDATE_CHART_OUTPUT.patch }, UPDATE_CHART_OUTPUT, 'Unité ajoutée.'))
}

/**
 * Scripted conversation: the first turn creates a chart for the request's
 * resource, every later turn updates it.
 */
export function assistantChatStream(body: AssistantChatBody): string {
  const userTurns = (body.messages ?? []).filter(message => message.role === 'user').length
  return userTurns <= 1 ? createChartStream(body.resource_id ?? '') : updateChartStream()
}

/**
 * Answers the chat request of `page` with `stream` (or with the stream `stream`
 * returns for the request body) instead of the fake services' script.
 */
export async function routeAssistantStream(page: Page, stream: string | ((body: AssistantChatBody) => string)) {
  const base = (process.env.NUXT_PUBLIC_ASSISTANT_API_BASE || process.env.FAKE_SERVICES_URL || 'http://localhost:3100').replace(/\/$/, '')
  // Matched without the query string: the transport adds `?lang=`, and a missed
  // route would reach the real assistant.
  await page.route(url => `${url.origin}${url.pathname}` === `${base}${ASSISTANT_CHAT_PATH}`, async (route) => {
    const origin = route.request().headers()['origin'] ?? '*'
    const cors = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
    }
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: cors })
      return
    }
    await route.fulfill({
      status: 200,
      headers: { ...cors, 'Content-Type': 'text/event-stream', 'x-vercel-ai-ui-message-stream': 'v1' },
      body: typeof stream === 'string' ? stream : stream(route.request().postDataJSON() as AssistantChatBody),
    })
  })
}
