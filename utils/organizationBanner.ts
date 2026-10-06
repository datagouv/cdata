// Organization page banner (data.gouv.fr#2049).
// Backend contract: udata serves `banner_color` (hex string), `banner_image`
// (URL, read-only in PATCH, managed by POST/DELETE .../banner/) and
// `banner_image_position` (int 0-100, CSS background-position-y semantics).

// Matches the current org page top strip so non-customized orgs see no change.
export const BANNER_DEFAULT_COLOR = '#F3F6FE'

export const BANNER_MAX_BYTES = 4 * 1024 * 1024
export const BANNER_MIN_WIDTH = 1200
export const BANNER_MIN_HEIGHT = 300
export const BANNER_ACCEPTED_EXTENSIONS = readonly(['jpeg', 'jpg', 'png'])

// DSFR decorative palette from the issue, in display order (first row of 9
// then the rest). Hex values are the official artwork colors.
export type DsfrBannerColor = { name: string, hex: string }

export const DSFR_BANNER_COLORS: Array<DsfrBannerColor> = [
  { name: 'green-tilleul-verveine', hex: '#b7a73f' },
  { name: 'green-bourgeon', hex: '#68a532' },
  { name: 'green-emeraude', hex: '#00a95f' },
  { name: 'green-menthe', hex: '#009081' },
  { name: 'green-archipel', hex: '#0099c6' },
  { name: 'blue-ecume', hex: '#465f9d' },
  { name: 'blue-cumulus', hex: '#7ab5e0' },
  { name: 'purple-glycine', hex: '#a558a0' },
  { name: 'pink-macaron', hex: '#e18b76' },
  { name: 'pink-tuile', hex: '#ce614a' },
  { name: 'yellow-tournesol', hex: '#fdcf41' },
  { name: 'yellow-moutarde', hex: '#c3992c' },
  { name: 'orange-terre-battue', hex: '#e4794a' },
  { name: 'brown-cafe-creme', hex: '#d1b781' },
  { name: 'brown-caramel', hex: '#c08c65' },
  { name: 'brown-opera', hex: '#bd987a' },
  { name: 'beige-gris-galet', hex: '#aea397' },
]

export function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null
  const value = Number.parseInt(match[1], 16)
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 }
}

export function normalizeHexColor(input: string): string | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(input.trim())
  return match ? `#${match[1].toLowerCase()}` : null
}

// Two-bucket luminance decision (breadcrumb text color). The weighted sum is
// the WCAG-ish approximation; gamma expansion is unnecessary for a dark/light
// split.
export function isDarkColor(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 }
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5
}

export type BannerFileError = 'format' | 'size' | 'dimensions'

// Total contract: never throws, including when the image's pixels can't be
// read (an unreadable image can't satisfy the minimum dimensions).
export async function validateBannerFile(
  file: File,
  getDimensions: (file: File) => Promise<{ width: number, height: number }> = readImageDimensions,
): Promise<BannerFileError | null> {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!BANNER_ACCEPTED_EXTENSIONS.includes(extension)) return 'format'
  if (file.size > BANNER_MAX_BYTES) return 'size'
  const dimensions = await getDimensions(file).catch(() => null)
  if (!dimensions || dimensions.width < BANNER_MIN_WIDTH || dimensions.height < BANNER_MIN_HEIGHT) return 'dimensions'
  return null
}

export function readImageDimensions(file: File): Promise<{ width: number, height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('unreadable-image'))
    }
    image.src = url
  })
}

// Height the banner image renders at under `background-size: cover`.
export function backgroundCoverHeight(containerWidth: number, naturalWidth: number, naturalHeight: number): number {
  if (naturalWidth <= 0) return 0
  return containerWidth * (naturalHeight / naturalWidth)
}

// Vertical drag → background-position-y percentage. Dragging the image down by
// `deltaPx` (positive) reveals its top: the position decreases.
export function positionFromDrag(startPosition: number, deltaPx: number, overflowPx: number): number {
  if (overflowPx <= 0) return 50
  const next = startPosition - (deltaPx / overflowPx) * 100
  return Math.min(100, Math.max(0, Math.round(next)))
}
