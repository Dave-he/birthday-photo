/**
 * Shared GLSL fragment shader for soft, glowy point particles.
 *
 * Used by both `MagicParticles` (ambient gold sparkles) and `Fireworks`
 * (exploding pyrotechnics). Each one ships its own vertex shader (they
 * move particles differently — drift vs. ballistic) but the on-screen
 * appearance is the same: a soft circular disc with a bright core.
 *
 * Kept as a string constant so it can be unit-tested with `node:test`
 * (no JSX, no Three.js runtime).
 */
export const PARTICLE_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;

  void main() {
    // Circular particle
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    if (distanceToCenter > 0.5) discard;

    // Soft edge glow — bright near the center, fades out.
    float strength = 0.05 / distanceToCenter - 0.1;

    gl_FragColor = vec4(uColor, strength);
  }
`

/** Names of the uniforms every particle shader in this project should declare. */
export const PARTICLE_UNIFORMS = ["uTime", "uColor", "uSize", "uPixelRatio"] as const
