import type { Page, Route } from '@playwright/test'
import { randomUUID } from 'node:crypto'

export const ASSISTANT_CHAT_PATH = '/api/1/assistant/chat/'
const ASSISTANT_MODELS_PATH = '/api/1/assistant/models/'

export type AssistantModelEntry = { id: string, label: string }

/** What `GET /assistant/models/` answers: the first model is the default one. */
const ASSISTANT_MODELS: Array<AssistantModelEntry> = [
  { id: 'gpt-oss-120b', label: 'GPT-OSS-120B' },
  { id: 'mistral-medium-3-5', label: 'Mistral Medium 3.5' },
]

/** Fields of the chat request body the fake assistant reads. */
export type AssistantChatBody = {
  id?: string
  model?: string | null
  resource_id?: string | null
  messages?: Array<{ role?: string }>
}

type Chunk = Record<string, unknown>

/** Tokens spent by a turn, as the `usage` of the `message-metadata` chunk. */
export type AssistantUsage = { inputTokens: number, outputTokens: number }

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

const UPDATE_CHART_OUTPUT = { status: 'ok', patch: { y_axis: { unit: 'doses' } } }

function toolCallChunks(toolName: string, input: unknown, output: unknown, text: string, usage?: AssistantUsage): Array<Chunk> {
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
    // As udata sends it: pydantic-ai's end-of-run chunk, before the last step closes, with a null usage when unknown.
    { type: 'message-metadata', messageMetadata: { pydantic_ai: { timestamp: new Date().toISOString() }, usage: usage ?? null } },
    { type: 'finish-step' },
    { type: 'finish', finishReason: 'stop' },
  ]
}

function toStream(chunks: Array<Chunk>): string {
  return `${chunks.map(chunk => `data: ${JSON.stringify(chunk)}\n\n`).join('')}data: [DONE]\n\n`
}

/** A Vercel AI UI message stream answering with one `create_chart` call for `resourceId`. */
export function createChartStream(
  resourceId: string,
  output: ReturnType<typeof createChartOutput> = createChartOutput(resourceId),
  usage?: AssistantUsage,
): string {
  return toStream(toolCallChunks('create_chart', { config: output.chart }, output, 'Graphique créé.', usage))
}

/** A Vercel AI UI message stream that fails, with the server's localized `errorText`. */
export function errorStream(errorText: string): string {
  return toStream([{ type: 'start' }, { type: 'error', errorText }])
}

/** A Vercel AI UI message stream answering with one `update_chart` call setting the Y unit. */
export function updateChartStream(): string {
  return toStream(toolCallChunks('update_chart', { patch: UPDATE_CHART_OUTPUT.patch }, UPDATE_CHART_OUTPUT, 'Unité ajoutée.'))
}

// Turns answered per conversation id: the client only sends its new question, as udata holds the history.
const turnsByConversation = new Map<string, number>()

/**
 * Scripted conversation: the first turn creates a chart for the request's
 * resource (with `createStream`, by default `createChartStream`), every later turn updates it.
 */
export function assistantChatStream(
  body: AssistantChatBody,
  createStream: (body: AssistantChatBody) => string = body => createChartStream(body.resource_id ?? ''),
): string {
  const turn = (turnsByConversation.get(body.id ?? '') ?? 0) + 1
  turnsByConversation.set(body.id ?? '', turn)
  return turn <= 1 ? createStream(body) : updateChartStream()
}

// The API is on another origin than the frontend, and the requests carry cookies.
function corsHeaders(route: Route, methods: string) {
  return {
    'Access-Control-Allow-Origin': route.request().headers()['origin'] ?? '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'content-type',
  }
}

/**
 * Answers the chat request of `page` with `stream` (or with the stream `stream`
 * returns for the request body).
 */
export async function routeAssistantStream(page: Page, stream: string | ((body: AssistantChatBody) => string)) {
  // Matched on the path alone, whatever the origin and the query string (`?lang=`)
  await page.route(url => url.pathname === ASSISTANT_CHAT_PATH, async (route) => {
    const cors = corsHeaders(route, 'POST, OPTIONS')
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

/** Refuses the chat request of `page` as udata does, with a `status` and its localized `message`. */
export async function routeAssistantRefusal(page: Page, status: number, message: string) {
  await page.route(url => url.pathname === ASSISTANT_CHAT_PATH, async (route) => {
    const cors = corsHeaders(route, 'POST, OPTIONS')
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: cors })
      return
    }
    await route.fulfill({ status, headers: cors, json: { message, status } })
  })
}

/** Answers the models list of `page` with `models`. */
export async function routeAssistantModels(page: Page, models: Array<AssistantModelEntry> = ASSISTANT_MODELS) {
  await page.route(url => url.pathname === ASSISTANT_MODELS_PATH, async (route) => {
    const cors = corsHeaders(route, 'GET, OPTIONS')
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: cors })
      return
    }
    await route.fulfill({ status: 200, headers: cors, json: models })
  })
}
