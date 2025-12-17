'use client'
import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('@/components/Scene'), {
  ssr: false,
  loading: () => <div>Loading...</div>
})

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Scene />
    </main>
  )
}
