'use client'

import { Html } from '@react-three/drei'

interface SceneTitleProps {
  title: string
  color: string
  accent: string
}

/**
 * Floating 3D title.
 *
 * Rendered as a DOM overlay anchored in 3D space instead of a troika mesh.
 * The troika pipeline has to build signed-distance-field glyphs for the whole
 * 3.4 MB Chinese font and never reports a failure back to React, so a slow
 * or unreachable font suspended the title forever — and while it shared the
 * outer Suspense boundary, it blanked the entire scene. The browser's own
 * text rendering with the self-hosted `@font-face` is instant, always
 * succeeds, and keeps Chinese characters intact.
 */
export default function SceneTitle({ title, color, accent }: SceneTitleProps) {
  return (
    <Html
      position={[0, 4.2, 0]}
      center
      zIndexRange={[10, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="font-display whitespace-nowrap text-center"
        style={{
          color,
          fontSize: 'clamp(1.6rem, 3.4vw, 2.6rem)',
          letterSpacing: '0.04em',
          textShadow: `0 0 18px ${accent}, 0 0 42px ${accent}55, 0 2px 8px rgba(0,0,0,0.75)`,
        }}
      >
        {title}
      </div>
    </Html>
  )
}
