import { describe, expect, it } from 'vitest'
import { escapeCsvValue, filesize, summarize } from '~/datagouv-components/src/functions/helpers'

describe('escapeCsvValue', () => {
  // Expected values come from RFC 4180, not from the implementation
  it('returns empty for null, undefined and empty string', () => {
    expect(escapeCsvValue(null)).toEqual('')
    expect(escapeCsvValue(undefined)).toEqual('')
    expect(escapeCsvValue('')).toEqual('')
  })

  it('leaves plain values untouched', () => {
    expect(escapeCsvValue('plain')).toEqual('plain')
    expect(escapeCsvValue(42)).toEqual('42')
  })

  it('quotes values containing separators or line breaks', () => {
    expect(escapeCsvValue('a,b')).toEqual('"a,b"')
    expect(escapeCsvValue('line\nbreak')).toEqual('"line\nbreak"')
  })

  it('doubles inner quotes', () => {
    expect(escapeCsvValue('say "hi"')).toEqual('"say ""hi"""')
  })
})

describe('summarize', () => {
  it('uses 1000-based units', () => {
    expect(summarize(0)).toEqual('0')
    expect(summarize(999)).toEqual('999')
    expect(summarize(1000)).toEqual('1K')
    expect(summarize(1000000)).toEqual('1M')
  })

  it('removes trailing zeros from the fraction', () => {
    expect(summarize(1000, 1)).toEqual('1K')
    expect(summarize(1500, 1)).toEqual('1.5K')
    expect(summarize(1500)).toEqual('2K')
  })
})

describe('filesize', () => {
  it('uses 1024-based units with the French octet suffix', () => {
    expect(filesize(1024)).toEqual('1,0 Ko')
    expect(filesize(1024 * 1024)).toEqual('1,0 Mo')
  })

  it('only switches unit at the 1024 boundary', () => {
    expect(filesize(1023)).toMatch(/\so$/)
    expect(filesize(1023)).not.toMatch(/Ko$/)
    expect(filesize(1025)).toMatch(/Ko$/)
  })
})
