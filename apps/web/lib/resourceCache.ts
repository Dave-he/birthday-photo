// The explicit `.ts` extension keeps this module importable by the Node test
// runner (`node --test --experimental-strip-types`), which does not resolve
// the `@/` alias or extensionless relative paths.

/**
 * A reference-counted cache for GPU resources.
 *
 * The gallery showed every photo on several ornaments at once, and every
 * ornament loaded its own copy of the texture: the same file was downloaded
 * again and again, and none of the copies were ever released, so the GPU
 * memory grew for the lifetime of the page.
 *
 * The cache hands out one shared resource per key and only disposes it once
 * the last user has released it.
 */
export class ResourceCache<T> {
  private readonly entries = new Map<string, { value: T; refs: number }>()
  private readonly pending = new Map<string, Promise<T>>()

  /**
   * Get the shared resource for `key`, loading it on first use.
   *
   * Concurrent callers share the same in-flight promise, so a photo that
   * appears on ten ornaments is still only downloaded once — and a second
   * caller never starts a second download.
   */
  async acquire(key: string, load: () => Promise<T>): Promise<T> {
    const existing = this.entries.get(key)
    if (existing) {
      existing.refs += 1
      return existing.value
    }

    const inFlight = this.pending.get(key)
    if (inFlight) {
      const value = await inFlight
      // The load has resolved, so the entry exists by now.
      const entry = this.entries.get(key)
      if (entry) entry.refs += 1
      return value
    }

    const promise = load().then(
      (value) => {
        this.pending.delete(key)
        this.entries.set(key, { value, refs: 1 })
        return value
      },
      (error) => {
        // A failed load must not leave a stuck entry behind.
        this.pending.delete(key)
        throw error
      },
    )

    this.pending.set(key, promise)
    return promise
  }

  /**
   * Release one use of a resource.
   *
   * Returns true when the resource was the last reference and has been
   * disposed.
   */
  release(key: string, dispose: (value: T) => void): boolean {
    const entry = this.entries.get(key)
    if (!entry) return false

    entry.refs -= 1
    if (entry.refs > 0) return false

    this.entries.delete(key)
    dispose(entry.value)
    return true
  }

  /** Number of live resources. */
  get size(): number {
    return this.entries.size
  }

  /** How many users a resource currently has. */
  refCount(key: string): number {
    return this.entries.get(key)?.refs ?? 0
  }

  /** Dispose everything, regardless of the reference counts. */
  disposeAll(dispose: (value: T) => void): void {
    for (const entry of this.entries.values()) dispose(entry.value)
    this.entries.clear()
    this.pending.clear()
  }
}
