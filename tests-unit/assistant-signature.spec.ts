import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

// RGAA 13.8: moving content that starts by itself stops by itself within 5 seconds.
describe('assistant signature animation', () => {
  const file = readFileSync(path.resolve(import.meta.dirname, '../public/nuxt_images/assistant/assistant-signature.webp'))

  function chunks(): Array<{ type: string, data: Buffer }> {
    const found: Array<{ type: string, data: Buffer }> = []
    for (let offset = 12; offset + 8 <= file.length;) {
      const size = file.readUInt32LE(offset + 4)
      found.push({ type: file.toString('ascii', offset, offset + 4), data: file.subarray(offset + 8, offset + 8 + size) })
      offset += 8 + size + (size % 2)
    }
    return found
  }

  it('plays once', () => {
    const anim = chunks().find(chunk => chunk.type === 'ANIM')
    expect(anim?.data.readUInt16LE(4)).toBe(1)
  })

  it('lasts less than 5 seconds', () => {
    const frames = chunks().filter(chunk => chunk.type === 'ANMF')
    expect(frames.length).toBeGreaterThan(1)
    const duration = frames.reduce((total, frame) => total + frame.data.readUIntLE(12, 3), 0)
    expect(duration).toBeLessThan(5000)
  })
})
