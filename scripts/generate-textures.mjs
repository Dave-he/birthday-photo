#!/usr/bin/env node
/**
 * Generate the self-hosted textures used by the 3D scene.
 *
 * 1. `cloud.png`       - the soft puff the atmospheric clouds are built from
 * 2. `placeholder.png` - the stand-in shown when a photo cannot be loaded
 * 3. `ground.png`      - the floor disc, with a radial alpha falloff
 *
 * All are generated locally on purpose: drei's <Cloud> ships a default
 * texture hosted on a public CDN, and `useTexture` suspends until it
 * arrives - a CDN that is unreachable (blocked, offline, air-gapped) leaves
 * the whole <Suspense> boundary pending and the entire scene blank. The
 * photo placeholder used to be a remote Unsplash URL for the same reason.
 *
 *   node scripts/generate-textures.mjs
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../apps/web/public/textures')

/** Deterministic value noise so the output is reproducible. */
function hash(x, y, seed) {
  let h = x * 374761393 + y * 668265263 + seed * 1274126177
  h = (h ^ (h >>> 13)) >>> 0
  h = Math.imul(h, 1274126177) >>> 0
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}

function smoothNoise(x, y, seed) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash(xi, yi, seed)
  const b = hash(xi + 1, yi, seed)
  const c = hash(xi, yi + 1, seed)
  const d = hash(xi + 1, yi + 1, seed)
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v
}

function fractalNoise(x, y) {
  let value = 0
  let amplitude = 0.5
  let frequency = 1
  for (let octave = 0; octave < 4; octave++) {
    value += smoothNoise(x * frequency, y * frequency, octave + 1) * amplitude
    frequency *= 2
    amplitude *= 0.5
  }
  return value
}

function crc32(buffer) {
  const table = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  let crc = 0xffffffff
  for (const byte of buffer) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(typeAndData), 0)
  return Buffer.concat([length, typeAndData, crc])
}

/** Encode an RGBA pixel buffer as a PNG. */
function encodePng(size, pixels) {
  const stride = size * 4
  const raw = Buffer.alloc(size * (stride + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0 // filter type: none
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type: RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/** Soft white puff with a noisy edge - the cloud billboard. */
function createCloudTexture(size = 128) {
  const pixels = Buffer.alloc(size * size * 4)
  const center = (size - 1) / 2
  let offset = 0

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - center) / center
      const dy = (y - center) / center
      const distance = Math.sqrt(dx * dx + dy * dy)

      let alpha = 1 - distance
      alpha = alpha <= 0 ? 0 : alpha * alpha * (3 - 2 * alpha)

      // Break up the perfect circle so the puffs look like clouds.
      const noise = fractalNoise((x / size) * 6, (y / size) * 6)
      alpha = Math.max(0, Math.min(1, alpha * (0.55 + noise * 0.75)))

      pixels[offset++] = 255
      pixels[offset++] = 255
      pixels[offset++] = 255
      pixels[offset++] = Math.round(alpha * 255)
    }
  }

  return encodePng(size, pixels)
}

/**
 * Placeholder shown on an ornament whose photo could not be loaded: a soft
 * diagonal gradient in the scene's accent tones with a faint photo frame.
 */
function createPlaceholderTexture(size = 256) {
  const pixels = Buffer.alloc(size * size * 4)
  let offset = 0

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const t = (x / size) * 0.6 + (y / size) * 0.4
      const noise = fractalNoise((x / size) * 8, (y / size) * 8)

      // Deep indigo -> warm amber, matching the christmas palette.
      const r = Math.round(38 + t * 150 + noise * 26)
      const g = Math.round(30 + t * 110 + noise * 22)
      const b = Math.round(72 + t * 40 + noise * 20)

      // A thin inset frame reads as "photo placeholder" at a glance.
      const inset = Math.min(x, y, size - 1 - x, size - 1 - y)
      const frame = inset < 10 ? 0.55 : 1

      pixels[offset++] = Math.min(255, Math.round(r * frame))
      pixels[offset++] = Math.min(255, Math.round(g * frame))
      pixels[offset++] = Math.min(255, Math.round(b * frame))
      pixels[offset++] = 255
    }
  }

  return encodePng(size, pixels)
}

/**
 * The floor disc.
 *
 * White with a radial alpha falloff, so the material's colour decides how
 * the floor looks while the alpha lets it dissolve into the fog instead of
 * ending in a hard edge. A little noise keeps the surface from looking
 * like a flat sheet of colour.
 */
function createGroundTexture(size = 256) {
  const pixels = Buffer.alloc(size * size * 4)
  const center = (size - 1) / 2
  let offset = 0

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - center) / center
      const dy = (y - center) / center
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Smooth falloff to zero at the rim.
      let alpha = 1 - distance
      alpha = alpha <= 0 ? 0 : alpha * alpha * (3 - 2 * alpha)

      const noise = fractalNoise((x / size) * 5, (y / size) * 5)
      // Subtle radial rings, like light pooling on a stage.
      const rings = 0.88 + Math.sin(distance * 14) * 0.05
      const value = Math.round(Math.min(1, Math.max(0, rings * (0.82 + noise * 0.36))) * 255)

      pixels[offset++] = value
      pixels[offset++] = value
      pixels[offset++] = value
      pixels[offset++] = Math.round(alpha * 255)
    }
  }

  return encodePng(size, pixels)
}

mkdirSync(OUT_DIR, { recursive: true })

const cloud = createCloudTexture()
writeFileSync(resolve(OUT_DIR, 'cloud.png'), cloud)
console.log(`Wrote ${resolve(OUT_DIR, 'cloud.png')} (128x128, ${cloud.length} bytes)`)

const placeholder = createPlaceholderTexture()
writeFileSync(resolve(OUT_DIR, 'placeholder.png'), placeholder)
console.log(`Wrote ${resolve(OUT_DIR, 'placeholder.png')} (256x256, ${placeholder.length} bytes)`)

const ground = createGroundTexture()
writeFileSync(resolve(OUT_DIR, 'ground.png'), ground)
console.log(`Wrote ${resolve(OUT_DIR, 'ground.png')} (256x256, ${ground.length} bytes)`)
