'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'

interface SceneErrorBoundaryProps {
  children: ReactNode
}

interface SceneErrorBoundaryState {
  error: Error | null
}

/**
 * Keeps a crash inside the 3D scene from taking the whole page down.
 *
 * A WebGL context loss, a driver hiccup or a bug in one of the scene
 * components used to throw during the React commit, which unmounted the
 * entire application and left the visitor with a blank white page — no
 * message, no way forward. The scene is the heart of the product, but it
 * must never be able to take the page down with it.
 */
export default class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  state: SceneErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): SceneErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('The 3D scene crashed:', error, info.componentStack)
  }

  private handleReload = () => {
    this.setState({ error: null })
    window.location.reload()
  }

  render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div
        role="alert"
        className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/85 px-6 text-center text-white"
      >
        <p className="text-2xl font-serif text-amber-200">The scene could not be displayed</p>
        <p className="max-w-md text-sm text-white/70">
          Your browser lost the 3D graphics context. Reloading usually fixes it — if it keeps
          happening, try enabling hardware acceleration in your browser settings.
        </p>
        <button
          onClick={this.handleReload}
          className="rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-black transition hover:bg-amber-400"
        >
          Reload the scene
        </button>
      </div>
    )
  }
}
