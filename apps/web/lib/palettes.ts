import type { Scene, SceneMode, Settings } from '@/types'

export interface Palette {
  /** Two-stop gradient used for the page background (top → bottom). */
  bg: [string, string]
  /** Solid color used for scene fog and R3F <color attach="background">. */
  fog: string
  /** Accent color used for emissive highlights and outlines. */
  accent: string
  /** Primary text color (used by the floating 3D title). */
  text: string
}

export const PALETTES: Record<SceneMode, Palette> = {
  christmas: {
    bg: ['#0f172a', '#000000'],
    fog: '#050505',
    accent: '#c2410c',
    text: '#fcd34d',
  },
  birthday: {
    bg: ['#2e1065', '#000000'],
    fog: '#1e1b4b',
    accent: '#d946ef',
    text: '#a855f7',
  },
  romantic: {
    bg: ['#4a044e', '#000000'],
    fog: '#2e0225',
    accent: '#ec4899',
    text: '#f472b6',
  },
  party: {
    bg: ['#1e3a8a', '#000000'],
    fog: '#172554',
    accent: '#3b82f6',
    text: '#60a5fa',
  },
}

const MODE_FALLBACK_TITLES: Record<SceneMode, string> = {
  christmas: 'Merry Christmas!',
  birthday: 'Happy Birthday!',
  romantic: 'Forever Love',
  party: "Let's Party!",
}

/**
 * Resolve the floating 3D title. Priority: matched scene name > mode fallback > greeting.
 */
export function getSceneTitle(
  mode: SceneMode,
  scenes: Pick<Scene, 'id' | 'name'>[],
  currentSceneId: string | null,
  settings: Pick<Settings, 'greeting_title'> | null,
): string {
  const sceneName = scenes.find((s) => s.id === currentSceneId)?.name
  if (sceneName) return sceneName

  if (mode === 'christmas') {
    return settings?.greeting_title || MODE_FALLBACK_TITLES.christmas
  }
  return MODE_FALLBACK_TITLES[mode]
}
