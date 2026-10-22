import { describe, expect, it } from 'vitest'
import { allTabularFixtures, REAL_TABULAR_API } from '../tests/tabularFixtures'

// The E2E tests run against responses of the Tabular API recorded once (tests/fake-services.ts).
// This checks the real API still answers each recorded request the same way, structure only:
// the data behind it is republished from time to time, which must not fail anything.

type Row = Record<string, unknown>

const typeOf = (value: unknown) => (value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value)

/** The JSON types each column holds across the rows, nulls aside. */
function columnTypes(rows: Array<Row>): Map<string, Set<string>> {
  const types = new Map<string, Set<string>>()
  for (const row of rows) {
    for (const [column, value] of Object.entries(row)) {
      if (!types.has(column)) types.set(column, new Set())
      if (value !== null) types.get(column)!.add(typeOf(value))
    }
  }
  return types
}

function expectSameRowsStructure(actual: Array<Row>, recorded: Array<Row>) {
  // Another page of rows may hold other values, or none at all: only columns both sides
  // returned, and types both sides saw, can be compared.
  if (!actual.length || !recorded.length) return
  const actualTypes = columnTypes(actual)
  const recordedTypes = columnTypes(recorded)
  expect([...actualTypes.keys()].sort()).toEqual([...recordedTypes.keys()].sort())
  for (const [column, types] of recordedTypes) {
    const real = actualTypes.get(column)!
    if (types.size && real.size) expect([...real].sort(), column).toEqual([...types].sort())
  }
}

type ProfileResponse = { profile: { header: Array<string>, columns: Record<string, { format: string, python_type: string }> } }

function expectSameProfile(actual: ProfileResponse, recorded: ProfileResponse) {
  const columns = (response: ProfileResponse) => Object.fromEntries(
    Object.entries(response.profile.columns).map(([column, info]) => [column, { format: info.format, python_type: info.python_type }]),
  )
  expect(actual.profile.header).toEqual(recorded.profile.header)
  expect(columns(actual)).toEqual(columns(recorded))
}

describe('the real Tabular API answers like the recorded fixtures', () => {
  const fixtures = allTabularFixtures()

  it('has recorded fixtures to check', () => {
    expect(fixtures.length).toBeGreaterThan(0)
  })

  it.each(fixtures.map(fixture => [fixture.request, fixture] as const))('%s', async (_, fixture) => {
    const response = await fetch(new URL(fixture.request, REAL_TABULAR_API))
    expect(response.status).toBe(fixture.status)
    if (!fixture.contentType.includes('json') || fixture.status >= 400) return

    const actual = await response.json()
    const recorded = JSON.parse(fixture.body)
    expect(Object.keys(actual).sort()).toEqual(Object.keys(recorded).sort())
    if (fixture.request.includes('/profile/')) {
      expectSameProfile(actual, recorded)
    }
    if (Array.isArray(recorded.data)) {
      expect(typeOf(actual.meta?.total)).toBe(typeOf(recorded.meta?.total))
      expectSameRowsStructure(actual.data, recorded.data)
    }
  })
})
