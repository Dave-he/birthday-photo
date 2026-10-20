const { inflateSync } = require('node:zlib')

/**
 * A tiny, dependency-free PNG reader for the E2E suite.
 *
 * The E2E tests need to know whether the 3D scene actually *painted*
 * something. A visible `<canvas>` proves nothing — a blank scene has a
 * canvas too, and so does a scene that renders nothing but a flat
 * background colour.
 *
 * Playwright's `element.screenshot()` returns a PNG, and Node can inflate
 * it with the built-in `zlib`. This decodes just enough of it (8-bit
 * truecolour, with or without alpha) to count the colours on screen.
 */

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

function paeth(a, b, c) {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  if (pa <= pb && pa <= pc) return a
  if (pb <= pc) return b
  return c
}

/**
 * Decode an 8-bit PNG into raw RGBA pixels.
 *
 * Returns null for anything this minimal reader does not support, so the
 * caller can fail with a clear message instead of misreading the data.
 */
function decodePng(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 8) return null
  if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) return null

  let offset = 8
  let width = 0
  let height = 0
  let bitDepth = 0
  let colorType = 0
  const idat = []

  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset)
    const type = buffer.toString('ascii', offset + 4, offset + 8)
    const data = buffer.subarray(offset + 8, offset + 8 + length)

    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      bitDepth = data[8]
      colorType = data[9]
    } else if (type === 'IDAT') {
      idat.push(data)
    } else if (type === 'IEND') {
      break
    }

    offset += 12 + length
  }

  if (bitDepth !== 8) return null
  // 2 = truecolour, 6 = truecolour with alpha.
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0
  if (channels === 0 || width === 0 || height === 0) return null

  const raw = inflateSync(Buffer.concat(idat))
  const stride = width * channels
  const pixels = Buffer.alloc(width * height * 4)

  // Undo the per-scanline filters.
  let previous = Buffer.alloc(stride)
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)))

    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? line[i - channels] : 0
      const b = previous[i]
      const c = i >= channels ? previous[i - channels] : 0
      switch (filter) {
        case 0: break
        case 1: line[i] = (line[i] + a) & 0xff; break
        case 2: line[i] = (line[i] + b) & 0xff; break
        case 3: line[i] = (line[i] + ((a + b) >> 1)) & 0xff; break
        case 4: line[i] = (line[i] + paeth(a, b, c)) & 0xff; break
        default: return null
      }
    }

    for (let x = 0; x < width; x++) {
      const source = x * channels
      const target = (y * width + x) * 4
      pixels[target] = line[source]
      pixels[target + 1] = line[source + 1]
      pixels[target + 2] = line[source + 2]
      pixels[target + 3] = channels === 4 ? line[source + 3] : 255
    }

    previous = line
  }

  return { width, height, pixels }
}

/**
 * Summarise what is on screen.
 *
 * - `distinctColors`: how many different quantised colours are visible.
 * - `saturatedRatio`: the share of pixels with a clearly visible colour
 *   difference between their strongest and weakest channel.
 * - `dominantRatio`: the share of the single most common quantised colour.
 */
function analyseImage(buffer) {
  const image = decodePng(buffer)
  if (!image) return null

  const { width, height, pixels } = image
  const counts = new Map()
  let saturated = 0

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]

    // Quantise to 5 bits per channel so that a smooth gradient counts as
    // one colour rather than thousands.
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)
    counts.set(key, (counts.get(key) ?? 0) + 1)

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    if (max - min > 25) saturated += 1
  }

  const total = width * height
  let dominant = 0
  for (const count of counts.values()) dominant = Math.max(dominant, count)

  return {
    width,
    height,
    total,
    distinctColors: counts.size,
    saturatedRatio: saturated / total,
    dominantRatio: dominant / total,
  }
}

module.exports = { decodePng, analyseImage }
