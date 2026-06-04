import { test } from "node:test"
import assert from "node:assert/strict"
import { PARTICLE_FRAGMENT_SHADER, PARTICLE_UNIFORMS } from "../../apps/web/lib/particleShader.ts"

test("the shared fragment shader discards points outside the unit circle", () => {
  // Pins the discard threshold so a typo ("0.4" instead of "0.5") gets caught.
  assert.match(PARTICLE_FRAGMENT_SHADER, /distance\(gl_PointCoord, vec2\(0\.5\)\)/)
  // Use [\s\S]*? so the `discard` can appear on the same line as the
  // `if` check OR separated by a comment.
  assert.match(PARTICLE_FRAGMENT_SHADER, /distanceToCenter\s*>\s*0\.5[\s\S]*?discard/)
})

test("the shared fragment shader applies a soft inverse-distance glow", () => {
  assert.match(PARTICLE_FRAGMENT_SHADER, /strength\s*=\s*0\.05\s*\/\s*distanceToCenter\s*-\s*0\.1/)
})

test("the shader reads the uColor uniform", () => {
  assert.match(PARTICLE_FRAGMENT_SHADER, /uniform\s+vec3\s+uColor/)
  assert.match(PARTICLE_FRAGMENT_SHADER, /gl_FragColor\s*=\s*vec4\(uColor, strength\)/)
})

test("PARTICLE_UNIFORMS lists every uniform the particle components declare", () => {
  // MagicParticles and Fireworks each declare exactly these four uniforms;
  // if a new one is added in either place, the constant should grow too.
  assert.deepEqual([...PARTICLE_UNIFORMS], ["uTime", "uColor", "uSize", "uPixelRatio"])
})
