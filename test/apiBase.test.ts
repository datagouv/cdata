import { describe, expect, it } from 'vitest'
import { toServerApiUrl } from '../utils/apiBase'

const PUBLIC = 'https://www.data.gouv.fr'
const PRIVATE = 'http://udata-api:7000'

describe('toServerApiUrl', () => {
  it('leaves URLs untouched when no private-network base is configured', () => {
    expect(toServerApiUrl('/api/1/datasets/', PUBLIC, '')).toBe('/api/1/datasets/')
    expect(toServerApiUrl(`${PUBLIC}/api/1/datasets/`, PUBLIC, '')).toBe(`${PUBLIC}/api/1/datasets/`)
  })

  it('prefixes a relative path with the private-network base', () => {
    expect(toServerApiUrl('/api/1/datasets/', PUBLIC, PRIVATE)).toBe(`${PRIVATE}/api/1/datasets/`)
  })

  it('prefixes a relative path that is missing its leading slash', () => {
    expect(toServerApiUrl('api/1/datasets/', PUBLIC, PRIVATE)).toBe(`${PRIVATE}/api/1/datasets/`)
  })

  it('swaps the host of an absolute public API URL (e.g. paginated next_page)', () => {
    expect(toServerApiUrl(`${PUBLIC}/api/1/datasets/?page=2`, PUBLIC, PRIVATE)).toBe(`${PRIVATE}/api/1/datasets/?page=2`)
  })

  it('leaves absolute URLs from other hosts untouched', () => {
    expect(toServerApiUrl('https://example.com/foo', PUBLIC, PRIVATE)).toBe('https://example.com/foo')
  })

  it('normalizes trailing slashes on both bases to avoid doubling', () => {
    expect(toServerApiUrl('/api/1/x', `${PUBLIC}/`, `${PRIVATE}/`)).toBe(`${PRIVATE}/api/1/x`)
    expect(toServerApiUrl(`${PUBLIC}/api/1/x`, `${PUBLIC}/`, `${PRIVATE}/`)).toBe(`${PRIVATE}/api/1/x`)
  })
})
