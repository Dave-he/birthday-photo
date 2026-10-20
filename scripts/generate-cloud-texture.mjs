#!/usr/bin/env node
/**
 * Generate the cloud puff texture used by the 3D scene.
 *
 * drei's <Cloud> ships a default texture hosted on a public CDN
 * (rawcdn.githack.com). `useTexture` suspends until the texture arrives, and
 * a CDN that is unreachable — blocked, offline, air-gapped — leaves the whole
 * <Suspense> boundary pending and the entire scene blank. This script
 * renders an equivalent soft puff locally so the app has zero external
 * asset dependencies.
 *
 *   node scripts/generate-cloud-texture.mjs
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SIZE = 128
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../apps/web/public/textures/cloud.png',
)

/** Deterministic value noise so the texture is reproducible. */
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

// RGB (white puff) + alpha (soft radial falloff modulated by noise).
const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1))
let offset = 0
const center = (SIZE - 1) / 2

for (let y = 0; y < SIZE; y++) {
  raw[offset++] = 0 // PNG filter type: none
  for (let x = 0; x < SIZE; x++) {
    const dx = (x - center) / center
    const dy = (y - center) / center
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Soft radial falloff.
    let alpha = 1 - distance
    if (alpha <= 0) {
      alpha = 0
    } else {
      alpha = alpha * alpha * (3 - 2 * alpha) // smoothstep
    }

    // Break up the perfect circle so the puffs look like clouds.
    const noise = fractalNoise((x / SIZE) * 6, (y / SIZE) * 6)
    alpha *= 0.55 + noise * 0.75
    alpha = Math.max(0, Math.min(1, alpha))

    raw[offset++] = 255
    raw[offset++] = 255
    raw[offset++] = 255
    raw[offset++] = Math.round(alpha * 255)
  }
}

function crc32(buffer) {
  let c
  const table = []
  for (let n = 0; n < 256; n++) {
    c = n
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

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(SIZE, 0)
ihdr.writeUInt32BE(SIZE, 4)
ihdr[8] = 8 // bit depth
ihdr[9] = 6 // color type: RGBA
ihdr[10] = 0
ihdr[11] = 0
ihdr[12] = 0

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
])

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, png)
console.log(`Wrote ${OUT} (${SIZE}x${SIZE}, ${png.length} bytes)`)
