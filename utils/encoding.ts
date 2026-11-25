const CHUNK_SIZE = 1024 * 1024

/**
 * Guess the text encoding of a delimited file so it can be decoded with the right
 * label instead of the UTF-8 default, which turns single-byte accents into �.
 *
 * The file is decoded chunk by chunk as strict UTF-8: any invalid byte disqualifies
 * it, wherever it sits. Returns a label accepted by `FileReader.readAsText` (and
 * `TextDecoder`); plain ASCII reports as UTF-8, which decodes it exactly.
 */
export async function detectFileEncoding(file: Blob): Promise<string> {
  const head = new Uint8Array(await file.slice(0, 2).arrayBuffer())
  // A UTF-16 BOM is 2 bytes: a shorter file cannot be UTF-16
  if (head.length >= 2) {
    if (head[0] === 0xFF && head[1] === 0xFE) return 'utf-16le'
    if (head[0] === 0xFE && head[1] === 0xFF) return 'utf-16be'
  }

  const decoder = new TextDecoder('utf-8', { fatal: true })
  try {
    for (let offset = 0; offset < file.size; offset += CHUNK_SIZE) {
      const chunk = new Uint8Array(await file.slice(offset, offset + CHUNK_SIZE).arrayBuffer())
      // `stream: true` buffers a multibyte character in the decoder until the next
      // chunk completes it, instead of failing the fatal decode
      decoder.decode(chunk, { stream: true })
    }
    // Without input, decode() ends the stream and decodes the internal buffer: a
    // pending partial sequence there means the file is truncated, so it is not UTF-8
    decoder.decode()
    return 'utf-8'
  }
  catch {
    // Spreadsheet exports of French data are almost always Windows-1252 (what
    // tools loosely call "Latin-1"): single-byte, ASCII-compatible, and every
    // non-ASCII byte maps to a character, so nothing is ever lost
    return 'windows-1252'
  }
}
