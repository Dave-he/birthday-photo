#!/usr/bin/env node
/**
 * Scene audit harness for the 3D gallery.
 *
 * The repo rule is that a 3D change is only verified when you *look at the
 * picture* — a visible `<canvas>` proves nothing, because a blank scene also
 * has a canvas. This script makes that check mechanical:
 *
 *   1. it drives the real app in a browser,
 *   2. it captures a PNG per scene mode,
 *   3. it instruments the WebGL context to report how many draw calls and
 *      how many instances the scene issues per frame.
 *
 * Draw calls / instances are deterministic, unlike wall-clock FPS, so they
 * are the numbers to watch when reviewing a performance change.
 *
 * Usage:
 *   node scripts/scene-audit.mjs [--url http://localhost:3000] [--out .scene-audit]
 *                              [--modes christmas,birthday,romantic,party]
 *                              [--layout tree] [--viewport 1440x900]
 *                              [--settle 1500] [--measure 2500]
 */

import { chromium } from '@playwright/test'
import { mkdir, writeFile, readdir, access } from 'node:fs/promises'
import { constants } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const argv = process.argv.slice(2)
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback
}

const URL = arg('url', process.env.E2E_WEB_URL || 'http://localhost:3000')
const OUT = path.resolve(arg('out', '.scene-audit'))
const MODES = arg('modes', 'christmas,birthday,romantic,party').split(',').filter(Boolean)
const LAYOUT = arg('layout', '')
const SETTLE = Number(arg('settle', 1500))
const MEASURE = Number(arg('measure', 2500))

/** The viewport to audit, e.g. `--viewport 390x844` for a phone. */
const [viewportWidth, viewportHeight] = arg('viewport', '1440x900').split('x').map(Number)

/**
 * Resolve a Chromium binary.
 *
 * Playwright pins an exact browser build, and a machine can easily have a
 * different (older) build cached — the audit would then refuse to start.
 * Prefer the pinned build and fall back to any full Chromium in the cache:
 * the full browser (not the headless shell) is needed for WebGL.
 */
async function resolveChromium() {
  const explicit = arg('chromium', process.env.E2E_CHROMIUM_EXECUTABLE_PATH)
  if (explicit) return explicit

  const cache = path.join(os.homedir(), 'Library/Caches/ms-playwright')
  try {
    const entries = await readdir(cache)
    const candidates = entries
      .filter((name) => name.startsWith('chromium-') && !name.includes('headless'))
      .sort()
      .reverse()
    for (const name of candidates) {
      for (const relative of [
        'chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
        'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
        'chrome-linux/chrome',
      ]) {
        const full = path.join(cache, name, relative)
        try {
          await access(full, constants.X_OK)
          return full
        } catch {
          /* try the next layout */
        }
      }
    }
  } catch {
    /* no cache directory */
  }
  return undefined
}

/**
 * Counts the WebGL draw calls the scene issues.
 *
 * `drawElementsInstanced` reports an `instanceCount`, so the harness can
 * tell "1 call, 40 instances" apart from "40 calls, 1 instance each" — the
 * difference between an instanced draw and a naive one.
 */
const INSTRUMENT = () => {
  const stats = {
    calls: 0,
    instances: 0,
    frames: 0,
    lastFrameCalls: 0,
    lastFrameInstances: 0,
    peakFrameCalls: 0,
    peakFrameInstances: 0,
  }
  window.__sceneAudit = stats

  const patch = (proto) => {
    if (!proto) return
    for (const method of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) {
      const original = proto[method]
      if (typeof original !== 'function') continue
      proto[method] = function patched(...args) {
        const instanceCount = method.endsWith('Instanced') ? (args[4] || 0) : 1
        stats.calls += 1
        stats.instances += instanceCount
        stats.lastFrameCalls += 1
        stats.lastFrameInstances += instanceCount
        return original.apply(this, args)
      }
    }
  }

  patch(window.WebGLRenderingContext?.prototype)
  patch(window.WebGL2RenderingContext?.prototype)

  const raf = window.requestAnimationFrame.bind(window)
  window.requestAnimationFrame = (callback) =>
    raf((time) => {
      stats.frames += 1
      if (stats.lastFrameCalls > stats.peakFrameCalls) stats.peakFrameCalls = stats.lastFrameCalls
      if (stats.lastFrameInstances > stats.peakFrameInstances) {
        stats.peakFrameInstances = stats.lastFrameInstances
      }
      stats.lastFrameCalls = 0
      stats.lastFrameInstances = 0
      callback(time)
    })
}

/** Reads the counters and resets the per-frame accumulators. */
const readStats = () => {
  const stats = window.__sceneAudit
  if (!stats) return null
  return {
    calls: stats.calls,
    instances: stats.instances,
    frames: stats.frames,
    peakFrameCalls: stats.peakFrameCalls,
    peakFrameInstances: stats.peakFrameInstances,
  }
}

async function measure(page, duration) {
  await page.evaluate(() => {
    const stats = window.__sceneAudit
    stats.calls = 0
    stats.instances = 0
    stats.frames = 0
    stats.peakFrameCalls = 0
    stats.peakFrameInstances = 0
  })

  await page.waitForTimeout(duration)

  const totals = await page.evaluate(readStats)
  if (!totals || totals.frames === 0) return null
  return {
    frames: totals.frames,
    fps: Number((totals.frames / (duration / 1000)).toFixed(1)),
    drawCallsPerFrame: Number((totals.calls / totals.frames).toFixed(1)),
    instancesPerFrame: Number((totals.instances / totals.frames).toFixed(1)),
    peakDrawCallsPerFrame: totals.peakFrameCalls,
    peakInstancesPerFrame: totals.peakFrameInstances,
  }
}

async function main() {
  await mkdir(OUT, { recursive: true })

  const browser = await chromium.launch({
    executablePath: await resolveChromium(),
    args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--ignore-gpu-blocklist'],
  })
  const page = await browser.newPage({
    viewport: { width: viewportWidth, height: viewportHeight },
  })

  const consoleErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`))

  await page.addInitScript(INSTRUMENT)

  console.log(`→ ${URL}`)
  await page.goto(URL, { waitUntil: 'domcontentloaded' })

  const enter = page.locator('button:has-text("ENTER EXPERIENCE")')
  await enter.waitFor({ timeout: 30000 })
  await enter.click()

  // The floating title only exists once the R3F tree has committed, so it is
  // the reliable "the scene is really there" signal.
  await page.locator('.font-display').waitFor({ timeout: 20000 })
  await page.waitForTimeout(SETTLE)

  if (LAYOUT) {
    const layoutButton = page.locator(`button:has-text("${LAYOUT}")`)
    if (await layoutButton.count()) {
      await layoutButton.first().click()
      await page.waitForTimeout(SETTLE)
    }
  }

  const results = []
  for (const mode of MODES) {
    const modeButton = page.locator(`button:has-text("${mode}")`).first()
    if (await modeButton.count()) {
      await modeButton.click()
    }
    await page.waitForTimeout(SETTLE)

    const metrics = await measure(page, MEASURE)
    const file = path.join(OUT, `${mode}.png`)
    await page.screenshot({ path: file })

    results.push({ mode, ...metrics, screenshot: path.relative(process.cwd(), file) })
    console.log(
      `  ${mode.padEnd(10)} fps=${String(metrics?.fps ?? 'n/a').padStart(5)}` +
        `  drawCalls/frame=${String(metrics?.drawCallsPerFrame ?? 'n/a').padStart(6)}` +
        `  instances/frame=${String(metrics?.instancesPerFrame ?? 'n/a').padStart(7)}` +
        `  → ${path.relative(process.cwd(), file)}`,
    )
  }

  const report = {
    url: URL,
    viewport: { width: viewportWidth, height: viewportHeight },
    layout: LAYOUT || 'default',
    results,
    consoleErrors,
  }
  await writeFile(path.join(OUT, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)

  await browser.close()

  if (consoleErrors.length) {
    console.log(`\n⚠ ${consoleErrors.length} console error(s):`)
    for (const error of consoleErrors.slice(0, 10)) console.log(`  ${error}`)
  }
  console.log(`\nReport: ${path.join(OUT, 'report.json')}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
