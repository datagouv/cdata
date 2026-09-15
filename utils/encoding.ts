const SAMPLE_SIZE = 64 * 1024

/**
 * Guess the text encoding of a delimited file so it can be decoded with the right
 * label instead of the UTF-8 default, which turns single-byte accents into �.
 *
 * Returns a label accepted by `FileReader.readAsText` (and `TextDecoder`). Plain
 * ASCII is reported as UTF-8, which decodes it exactly.
 */
export async function detectFileEncoding(file: Blob): Promise<string> {
  const sample = new Uint8Array(await file.slice(0, SAMPLE_SIZE).arrayBuffer())

  if (sample.length >= 2) {
    if (sample[0] === 0xFF && sample[1] === 0xFE) return 'utf-16le'
    if (sample[0] === 0xFE && sample[1] === 0xFF) return 'utf-16be'
  }

  try {
    new TextDecoder('utf-8', { fatal: true }).decode(sample)
    return 'utf-8'
  }
  catch {
    // Spreadsheet exports of French data are almost always Windows-1252 (what
    // tools loosely call "Latin-1"): single-byte, ASCII-compatible, and every
    // non-ASCII byte maps to a character, so nothing is ever lost
    return 'windows-1252'
  }
}
