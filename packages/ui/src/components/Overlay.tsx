'use client'

import { motion, AnimatePresence } from 'framer-motion'

export interface OverlayProps {
  isLoading: boolean
  onStart: () => void
  title: string
}

export default function Overlay({ isLoading, onStart, title }: OverlayProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl backdrop-blur-md max-w-lg w-full text-white"
      >
        <h1 className="text-3xl font-bold mb-4 text-center">{title}</h1>
        <p className="text-center mb-8 text-white/80">Click the button below to start the experience</p>
        <button
          className="w-full py-3 px-6 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          onClick={onStart}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Start"}
        </button>
      </motion.div>
    </div>
  )
}
