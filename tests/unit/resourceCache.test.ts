import { test } from "node:test"
import assert from "node:assert/strict"
import { ResourceCache } from "../../apps/web/lib/resourceCache.ts"

test("a resource is only loaded once, however many users ask for it", async () => {
  const cache = new ResourceCache<string>()
  let loads = 0

  const load = async () => {
    loads += 1
    return "texture"
  }

  const [a, b] = await Promise.all([cache.acquire("a", load), cache.acquire("a", load)])
  assert.equal(a, "texture")
  assert.equal(b, "texture")
  assert.equal(loads, 1, "the second caller must reuse the first load")
  assert.equal(cache.refCount("a"), 2)
})

test("a resource is disposed only when the last user releases it", async () => {
  const cache = new ResourceCache<string>()
  const disposed: string[] = []
  const dispose = (value: string) => disposed.push(value)

  await cache.acquire("a", async () => "texture")
  await cache.acquire("a", async () => "texture")
  assert.equal(cache.refCount("a"), 2)

  assert.equal(cache.release("a", dispose), false, "the first release must not dispose")
  assert.equal(disposed.length, 0)
  assert.equal(cache.release("a", dispose), true, "the last release must dispose")
  assert.deepEqual(disposed, ["texture"])
  assert.equal(cache.size, 0)
})

test("releasing an unknown resource is a no-op", () => {
  const cache = new ResourceCache<string>()
  let disposed = 0
  assert.equal(cache.release("nope", () => { disposed += 1 }), false)
  assert.equal(disposed, 0)
})

test("disposeAll releases everything regardless of the reference counts", async () => {
  const cache = new ResourceCache<string>()
  const disposed: string[] = []
  await cache.acquire("a", async () => "A")
  await cache.acquire("b", async () => "B")
  await cache.acquire("a", async () => "A")

  cache.disposeAll((value) => disposed.push(value))
  assert.deepEqual(disposed.sort(), ["A", "B"])
  assert.equal(cache.size, 0)
})

test("a released resource can be loaded again", async () => {
  const cache = new ResourceCache<number>()
  let loads = 0
  const load = async () => {
    loads += 1
    return loads
  }

  await cache.acquire("a", load)
  cache.release("a", () => {})
  const again = await cache.acquire("a", load)
  assert.equal(again, 2, "the resource must be fetched again after it was released")
})
