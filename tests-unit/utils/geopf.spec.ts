import { describe, expect, it } from 'vitest'
import { geopfDatasetStatusKey, geopfDatasetStatusUrl, isGeopfReauthRequired } from '~/utils/geopf'

describe('geopfDatasetStatusUrl', () => {
  it('builds the per-dataset status route', () => {
    expect(geopfDatasetStatusUrl('abc123')).toBe('/api/1/geopf/status/abc123/')
  })
})

describe('geopfDatasetStatusKey', () => {
  it('builds a key stable for a given dataset id', () => {
    expect(geopfDatasetStatusKey('abc123')).toBe('geopf-status-abc123')
    expect(geopfDatasetStatusKey('abc123')).toBe(geopfDatasetStatusKey('abc123'))
  })

  it('differs across dataset ids', () => {
    expect(geopfDatasetStatusKey('abc123')).not.toBe(geopfDatasetStatusKey('def456'))
  })
})

describe('isGeopfReauthRequired', () => {
  it('is false for non-object or response-less errors', () => {
    expect(isGeopfReauthRequired(null)).toBe(false)
    expect(isGeopfReauthRequired(undefined)).toBe(false)
    expect(isGeopfReauthRequired('nope')).toBe(false)
    expect(isGeopfReauthRequired(new Error('boom'))).toBe(false)
  })

  it('is false for a response with another status', () => {
    expect(isGeopfReauthRequired({ response: { status: 500 } })).toBe(false)
    expect(isGeopfReauthRequired({ response: {} })).toBe(false)
  })

  it('is true only for a 424 response', () => {
    expect(isGeopfReauthRequired({ response: { status: 424 } })).toBe(true)
  })
})
