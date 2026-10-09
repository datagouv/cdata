import { describe, expect, it } from 'vitest'
import {
  BANNER_ACCEPTED_EXTENSIONS,
  BANNER_DEFAULT_COLOR,
  BANNER_MAX_BYTES,
  BANNER_MIN_HEIGHT,
  BANNER_MIN_WIDTH,
  DSFR_BANNER_COLORS,
  backgroundCoverHeight,
  isDarkColor,
  normalizeHexColor,
  positionFromDrag,
  validateBannerFile,
} from '~/utils/organizationBanner'

describe('normalizeHexColor', () => {
  it('accepts #RRGGBB and bare RRGGBB, lowercases, and keeps the #', () => {
    expect(normalizeHexColor('#A558A0')).toBe('#a558a0')
    expect(normalizeHexColor('a558a0')).toBe('#a558a0')
    expect(normalizeHexColor('  #000091  ')).toBe('#000091')
  })

  it('rejects anything else', () => {
    expect(normalizeHexColor('#fff')).toBeNull()
    expect(normalizeHexColor('red')).toBeNull()
    expect(normalizeHexColor('#12345g')).toBeNull()
    expect(normalizeHexColor('')).toBeNull()
  })
})

describe('isDarkColor', () => {
  it('buckets colors for breadcrumb contrast', () => {
    expect(isDarkColor('#000000')).toBe(true)
    expect(isDarkColor('#465F9D')).toBe(true) // blue-ecume: dark
    expect(isDarkColor('#A558A0')).toBe(true) // purple-glycine: dark
    expect(isDarkColor('#FFFFFF')).toBe(false)
    expect(isDarkColor('#FDCF41')).toBe(false) // yellow-tournesol: light
    expect(isDarkColor('#f3f6fe')).toBe(false) // default banner: light
    expect(isDarkColor('invalid')).toBe(true) // fails safe: dark
  })
})

describe('DSFR_BANNER_COLORS', () => {
  it('has the 17 issue colors, 9 per first row, all valid hex', () => {
    expect(DSFR_BANNER_COLORS).toHaveLength(17)
    for (const { hex } of DSFR_BANNER_COLORS) {
      expect(normalizeHexColor(hex)).toBe(hex)
    }
  })
})

describe('validateBannerFile', () => {
  const file = (name: string, size = 100) => ({ name, size }) as File
  const dims = () => Promise.resolve({ width: 1600, height: 400 })

  it('rejects unsupported formats', async () => {
    expect(await validateBannerFile(file('photo.webp'), dims)).toBe('format')
    expect(await validateBannerFile(file('photo.gif'), dims)).toBe('format')
    expect(await validateBannerFile(file('noextension'), dims)).toBe('format')
  })

  it('accepts jpg/jpeg/png case-insensitively', async () => {
    for (const name of ['a.jpg', 'b.JPEG', 'c.png']) {
      expect(await validateBannerFile(file(name), dims)).toBeNull()
    }
  })

  it('rejects files over 4 MiB', async () => {
    expect(await validateBannerFile(file('big.png', BANNER_MAX_BYTES + 1), dims)).toBe('size')
    expect(await validateBannerFile(file('ok.png', BANNER_MAX_BYTES), dims)).toBeNull()
  })

  it('rejects images below 1200x300', async () => {
    const small = () => Promise.resolve({ width: 800, height: 300 })
    const short = () => Promise.resolve({ width: 1200, height: 200 })
    expect(await validateBannerFile(file('small.png'), small)).toBe('dimensions')
    expect(await validateBannerFile(file('short.png'), short)).toBe('dimensions')
    expect(await validateBannerFile(file('exact.png'), () => Promise.resolve({ width: 1200, height: 300 }))).toBeNull()
  })

  it('returns dimensions when the image cannot be read', async () => {
    const unreadable = () => Promise.reject(new Error('unreadable-image'))
    expect(await validateBannerFile(file('broken.png'), unreadable)).toBe('dimensions')
  })

  it('exposes the constants', () => {
    expect(BANNER_ACCEPTED_EXTENSIONS).toEqual(['jpeg', 'jpg', 'png'])
    expect(BANNER_MIN_WIDTH).toBe(1200)
    expect(BANNER_MIN_HEIGHT).toBe(300)
    expect(BANNER_DEFAULT_COLOR).toBe('#F3F6FE')
  })
})

describe('reposition math', () => {
  it('computes cover-rendered image height', () => {
    expect(backgroundCoverHeight(1200, 2400, 800)).toBe(400) // 2x image downscaled
    expect(backgroundCoverHeight(1200, 1200, 300)).toBe(300) // same ratio
    expect(backgroundCoverHeight(1200, 600, 600)).toBe(1200) // portrait upscale
  })

  it('maps drag delta to a 0-100 position, clamped', () => {
    // 100px overflow: dragging down 50px reveals the top → position 50 - 50 = 0
    expect(positionFromDrag(50, 50, 100)).toBe(0)
    expect(positionFromDrag(50, -50, 100)).toBe(100)
    expect(positionFromDrag(20, 1000, 100)).toBe(0)
    expect(positionFromDrag(80, -1000, 100)).toBe(100)
  })

  it('returns 50 when the image does not overflow the container', () => {
    expect(positionFromDrag(10, 30, 0)).toBe(50)
    expect(positionFromDrag(10, 30, -5)).toBe(50)
  })
})
