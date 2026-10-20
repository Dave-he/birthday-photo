#!/usr/bin/env node
/**
 * Start both apps in development mode with a single command.
 *
 * Dependency-free on purpose: the monorepo keeps per-app installs (each app
 * has its own lockfile), so we cannot lean on `pnpm -r --parallel` without
 * restructuring the install topology.
 *
 *   node scripts/dev.mjs            # start web + admin
 *   node scripts/dev.mjs web        # start only the 3D client
 *   node scripts/dev.mjs admin      # start only the admin panel
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const TARGETS = {
  web: { cwd: join(root, 'apps', 'web'), cmd: 'pnpm', args: ['dev'], color: '\x1b[36m' },
  admin: { cwd: join(root, 'apps', 'admin'), cmd: 'pnpm', args: ['dev'], color: '\x1b[35m' },
}

const requested = process.argv.slice(2).filter((arg) => arg in TARGETS)
const names = requested.length > 0 ? requested : Object.keys(TARGETS)

const RESET = '\x1b[0m'
const children = []
let shuttingDown = false

function prefixStream(stream, target) {
  let buffer = ''
  stream.on('data', (chunk) => {
    buffer += chunk.toString()
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      stream.write(`${target.color}[${target.name}]${RESET} ${line}\n`)
    }
  })
}

function start(target) {
  const { cwd, cmd, args, color, name } = target

  if (!existsSync(join(cwd, 'node_modules'))) {
    console.error(
      `${color}[${name}]${RESET} dependencies are missing — run \`pnpm --dir ${cwd.replace(root + '/', '')} install\` first.`,
    )
    process.exitCode = 1
    return
  }

  const child = spawn(cmd, args, {
    cwd,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  })

  prefixStream(child.stdout, target)
  prefixStream(child.stderr, target)

  child.on('exit', (code, signal) => {
    if (shuttingDown) return
    console.error(`${color}[${name}]${RESET} exited (code=${code}, signal=${signal}) — stopping the other app.`)
    shutdown(code ?? 1)
  })

  children.push(child)
}

function shutdown(code = 0) {
  if (shuttingDown) return
  shuttingDown = true
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM')
  }
  process.exit(code)
}

for (const name of names) {
  start(TARGETS[name])
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
