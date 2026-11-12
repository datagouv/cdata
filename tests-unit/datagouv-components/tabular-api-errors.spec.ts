import { afterEach, describe, expect, it, vi } from 'vitest'
import { decodeTabularError, fetchTabularData, hasMoreGroups, TabularApiError, tabularErrorMessage } from '~/datagouv-components/src/functions/tabularApi'
import type { PluginConfig } from '~/datagouv-components/src/config'
import type { TranslationFunction } from '~/datagouv-components/src/composables/useTranslation'

const { ofetchMock } = vi.hoisted(() => ({ ofetchMock: vi.fn() }))
vi.mock('ofetch', () => ({ ofetch: ofetchMock }))

const t: TranslationFunction = (key, options) => key.replace(/\{(\w+)\}/g, (_, name: string) => String((options as Record<string, unknown>)[name]))

// Shaped like the FetchError ofetch throws: `data` is the parsed body, a string when it is not JSON.
function fetchError(statusCode: number | undefined, data?: unknown) {
  return Object.assign(new Error(`[GET] /data/: ${statusCode}`), { statusCode, data })
}

function databaseError(code: string, message: string, hint: string | null = null) {
  return { errors: [{ code: null, title: 'Database error', detail: { code, details: null, hint, message } }] }
}

function decode(statusCode: number | undefined, data?: unknown) {
  const error = decodeTabularError(fetchError(statusCode, data))
  return { message: tabularErrorMessage(error, t), retryable: error.retryable, statusCode: error.statusCode }
}

// Bodies read on api-tabular 0.4.2 (vacsi-fra) unless noted.
describe('decodeTabularError', () => {
  it('names the unknown column, without the internal table name', () => {
    expect(decode(400, databaseError('42703', 'column efe2331467c445d389a23faef82fae90.nope does not exist'))).toEqual({
      message: 'La colonne nope n’existe pas dans cette ressource.',
      retryable: false,
      statusCode: 400,
    })
  })

  it('keeps the dots and spaces of an unknown column name', () => {
    expect(decode(400, databaseError('42703', 'column csvapi.efe2331467c445d389a23faef82fae90.Nb Hab. x does not exist')).message)
      .toBe('La colonne Nb Hab. x n’existe pas dans cette ressource.')
  })

  it('falls back to a generic unknown-column message when the column cannot be read', () => {
    expect(decode(400, databaseError('42703', 'something else')).message)
      .toBe('Colonne inconnue : une colonne du graphique n’existe pas dans cette ressource.')
  })

  it.each([
    ['22P02', 'bigint', 'un nombre entier'],
    ['22P02', 'double precision', 'un nombre'],
    ['22007', 'date', 'une date'],
    ['22P02', 'uuid', 'du type uuid'],
  ])('explains a filter value of the wrong type (%s, %s)', (code, type, expected) => {
    expect(decode(400, databaseError(code, `invalid input syntax for type ${type}: "abc"`))).toEqual({
      message: `Une valeur de filtre n’a pas le bon type : « abc » n’est pas ${expected}.`,
      retryable: false,
      statusCode: 400,
    })
  })

  it('still flags a wrong-type value it cannot quote', () => {
    expect(decode(400, databaseError('22P02', 'unexpected wording')).message).toBe('Une valeur de filtre n’a pas le bon type.')
  })

  it('reads a missing aggregate function as a calculation impossible on the column', () => {
    expect(decode(404, databaseError('42883', 'function sum(character varying) does not exist', 'No function matches the given name and argument types.'))).toEqual({
      message: 'Ce calcul n’est pas possible sur cette colonne.',
      retryable: false,
      statusCode: 404,
    })
  })

  // api-tabular core/query.py, with ALLOW_AGGREGATION off
  it('reads a forbidden aggregation', () => {
    const body = { errors: [{ code: null, title: 'Unauthorized parameters', detail: 'Aggregation parameters `n__sum` are not allowed for resource \'efe23314-67c4-45d3-89a2-3faef82fae90\'' }] }
    expect(decode(403, body)).toEqual({ message: 'Agrégation non autorisée sur cette ressource.', retryable: false, statusCode: 403 })
  })

  // api-tabular core/query.py raise_if_not_index: a Python set of the indexed columns
  it('lists the indexed columns of a large resource, sorted', () => {
    const body = { errors: [{ code: null, title: 'Unauthorized parameters', detail: 'dep is not among the allowed columns: {\'region\', "l\'année"}' }] }
    expect(decode(403, body).message).toBe('Colonne dep non indexée : seules les colonnes l\'année, region peuvent être regroupées ou agrégées.')
  })

  it('gives no readable message for another 403', () => {
    expect(decode(403, { errors: [{ title: 'Forbidden', detail: 'nope' }] })).toEqual({ message: null, retryable: false, statusCode: 403 })
  })

  it('reads a plain-text 404 as data not available, worth a retry', () => {
    expect(decode(404, '404: Not Found')).toEqual({
      message: 'Les données de cette ressource ne sont pas disponibles.',
      retryable: true,
      statusCode: 404,
    })
  })

  it('reads a missing table as data not available', () => {
    expect(decode(404, databaseError('42P01', 'relation "csvapi.efe2331467c445d389a23faef82fae90" does not exist')).message)
      .toBe('Les données de cette ressource ne sont pas disponibles.')
  })

  it('shows the detail of an api-tabular parser refusal, without the internal table name', () => {
    const body = { errors: [{ code: null, title: 'Invalid query string', detail: 'Malformed query: argument \'n_dose1__foo=1\' could not be parsed in efe2331467c445d389a23faef82fae90' }] }
    expect(decode(400, body)).toEqual({
      message: 'Malformed query: argument \'n_dose1__foo=1\' could not be parsed in ressource',
      retryable: false,
      statusCode: 400,
    })
  })

  it.each([
    ['a network or CORS failure', undefined, undefined],
    ['a 500 without body', 500, undefined],
    ['a 502 with an HTML body', 502, '<html>Bad Gateway</html>'],
  ])('gives no readable message for %s, worth a retry', (_, statusCode, data) => {
    expect(decode(statusCode, data)).toMatchObject({ message: null, retryable: true })
  })

  it.each([
    ['an unknown database code', databaseError('XX000', 'internal error')],
    ['an errors list without detail', { errors: [{}] }],
    ['an empty errors list', { errors: [] }],
    ['a body that is not JSON', 'Bad Request'],
  ])('gives no readable message, and no retry, for a 400 with %s', (_, data) => {
    expect(decode(400, data)).toEqual({ message: null, retryable: false, statusCode: 400 })
  })

  it('gives no readable message for an error that does not come from tabular-api', () => {
    expect(tabularErrorMessage(new Error('boom'), t)).toBeNull()
    expect(tabularErrorMessage(null, t)).toBeNull()
  })
})

describe('fetchTabularData errors', () => {
  const config = { tabularApiUrl: 'https://tabular.example.com' } as PluginConfig
  afterEach(() => ofetchMock.mockReset())

  it('rejects with a decoded TabularApiError carrying the status', async () => {
    ofetchMock.mockRejectedValue(fetchError(400, databaseError('42703', 'column efe2331467c445d389a23faef82fae90.nope does not exist')))
    const error = await fetchTabularData(config, { resourceId: 'r' }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(TabularApiError)
    expect((error as TabularApiError).statusCode).toBe(400)
    expect(tabularErrorMessage(error, t)).toBe('La colonne nope n’existe pas dans cette ressource.')
  })

  it('still reads a 416 as no further group in the 51st-group probe', async () => {
    ofetchMock.mockRejectedValue(fetchError(416, databaseError('PGRST103', 'Requested range not satisfiable')))
    await expect(hasMoreGroups(config, { resourceId: 'r', pageSize: 50 })).resolves.toBe(false)
  })
})
