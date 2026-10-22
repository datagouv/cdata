// Responses of the real Tabular API, recorded once and replayed by tests/fake-services.ts so
// that no E2E test depends on it. tests-unit/tabular-api-contract.spec.ts checks the real API
// still answers each recorded request with the same structure.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

export const REAL_TABULAR_API = 'https://tabular-api.data.gouv.fr'

const FIXTURES_DIR = path.join(import.meta.dirname, 'fixtures', 'tabular')

export type TabularFixture = {
  /** Path and query, relative to the API root, query params sorted */
  request: string
  status: number
  contentType: string
  body: string
}

/** The same request whatever the order its params were written in. */
export function tabularRequestKey(pathname: string, search: string): string {
  const params = search.replace(/^\?/, '').split('&').filter(Boolean).sort()
  return params.length ? `${pathname}?${params.join('&')}` : pathname
}

function fixtureFile(request: string): string {
  return path.join(FIXTURES_DIR, `${createHash('sha1').update(request).digest('hex')}.json`)
}

export function readTabularFixture(request: string): TabularFixture | null {
  const file = fixtureFile(request)
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) as TabularFixture : null
}

export function writeTabularFixture(fixture: TabularFixture): void {
  mkdirSync(FIXTURES_DIR, { recursive: true })
  writeFileSync(fixtureFile(fixture.request), `${JSON.stringify(fixture, null, 2)}\n`)
}

export function allTabularFixtures(): Array<TabularFixture> {
  if (!existsSync(FIXTURES_DIR)) return []
  return readdirSync(FIXTURES_DIR)
    .filter(file => file.endsWith('.json'))
    .map(file => JSON.parse(readFileSync(path.join(FIXTURES_DIR, file), 'utf8')) as TabularFixture)
}
