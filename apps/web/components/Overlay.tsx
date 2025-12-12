'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface OverlayProps {
  onStart: () => void
  isLoading: boolean
  title: string
}

export default function Overlay({ onStart, isLoading, title }: OverlayProps) {
  const [started, setStarted] = useState(false)

  const handleStart = () => {
    setStarted(true)
    onStart()
  }

  return (
    <AnimatePresence>
      {!started && (
        <motion.div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1 } }}
        >
          {/* Background Gradient/Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black opacity-80" />
          
          <div className="z-10 flex flex-col items-center space-y-8 p-4 text-center">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl md:text-6xl font-serif text-amber-200 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]"
            >
              {title || "Christmas Memories"}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 max-w-md font-light"
            >
              A 3D journey through our cherished moments. 
              <br/>Put on your headphones for the best experience.
            </motion.p>

            {isLoading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                <span className="text-sm text-amber-500/80 uppercase tracking-widest">Loading Magic...</span>
              </motion.div>
            ) : (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(251,191,36,0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-full font-semibold tracking-wide shadow-lg hover:shadow-amber-500/20 transition-all"
              >
                ENTER EXPERIENCE
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
