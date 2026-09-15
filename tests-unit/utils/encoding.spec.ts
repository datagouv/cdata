import { describe, expect, it } from 'vitest'
import { detectFileEncoding } from '~/utils/encoding'

function fileFrom(bytes: ArrayLike<number>): File {
  return new File([new Uint8Array(bytes)], 'data.csv')
}

describe('detectFileEncoding', () => {
  it('returns utf-8 for ASCII content', async () => {
    expect(await detectFileEncoding(fileFrom([0x69, 0x64, 0x3B, 0x6E]))).toBe('utf-8')
  })

  it('returns utf-8 for UTF-8 content with multibyte characters', async () => {
    // "Cé" in UTF-8
    expect(await detectFileEncoding(fileFrom([0x43, 0xC3, 0xA9]))).toBe('utf-8')
  })

  it('detects Windows-1252 content (single-byte "é")', async () => {
    expect(await detectFileEncoding(fileFrom([0x43, 0x61, 0x72, 0x74, 0x65, 0x20, 0xE9]))).toBe('windows-1252')
  })

  it('detects UTF-16LE content from its BOM', async () => {
    expect(await detectFileEncoding(fileFrom([0xFF, 0xFE, 0x69, 0x00]))).toBe('utf-16le')
  })

  it('detects UTF-16BE content from its BOM', async () => {
    expect(await detectFileEncoding(fileFrom([0xFE, 0xFF, 0x00, 0x69]))).toBe('utf-16be')
  })

  it('returns utf-8 for an empty file', async () => {
    expect(await detectFileEncoding(fileFrom([]))).toBe('utf-8')
  })
})
