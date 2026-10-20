'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Photo } from '@/types'
import { getActiveImageUrl } from '@/lib/activeImageUrl'

interface PhotoModalProps {
  selectedPhoto: Photo | null
  onClose: () => void
  /** Navigate inside the currently loaded gallery. */
  onNext?: () => void
  onPrev?: () => void
  /** 1-based position of the open photo inside the gallery. */
  position?: { index: number; total: number } | null
}

export default function PhotoModal({ selectedPhoto, onClose, onNext, onPrev, position }: PhotoModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const restoreFocusRef = useRef<Element | null>(null)

  // Keyboard handling + scroll lock while the modal is open.
  useEffect(() => {
    if (!selectedPhoto) return

    restoreFocusRef.current = document.activeElement

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        onNext?.()
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onPrev?.()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    // Prevent the page behind the modal from scrolling.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Move focus into the dialog so screen readers announce it.
    closeButtonRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      if (restoreFocusRef.current instanceof HTMLElement) {
        restoreFocusRef.current.focus()
      }
    }
  }, [selectedPhoto, onClose, onNext, onPrev])

  return (
    <AnimatePresence>
      {selectedPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={selectedPhoto.title || 'Photo detail'}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            className="bg-white/10 border border-white/20 p-6 rounded-2xl max-w-2xl w-full text-white shadow-2xl relative backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close photo detail"
              className="absolute top-4 right-4 text-white/50 hover:text-white z-10"
              onClick={onClose}
            >
              ✕
            </button>

            {/* Prev / Next */}
            {onPrev && (
              <button
                type="button"
                aria-label="Previous photo"
                onClick={onPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/40 text-white/70 hover:bg-black/60 hover:text-white transition-colors"
              >
                ‹
              </button>
            )}
            {onNext && (
              <button
                type="button"
                aria-label="Next photo"
                onClick={onNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/40 text-white/70 hover:bg-black/60 hover:text-white transition-colors"
              >
                ›
              </button>
            )}

            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2 aspect-square relative rounded-lg overflow-hidden border border-white/10 shadow-inner bg-black/20">
                <Image
                  src={getActiveImageUrl(selectedPhoto.image_url)}
                  alt={selectedPhoto.title || 'Photo Detail'}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className="flex-1 flex flex-col justify-center text-left">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-serif mb-2 text-amber-300">{selectedPhoto.title}</h2>
                  {position && (
                    <span className="text-xs text-white/40 tabular-nums">
                      {position.index} / {position.total}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedPhoto.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/70">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-lg leading-relaxed text-gray-200 font-light italic mb-6">
                  &quot;{selectedPhoto.description}&quot;
                </p>

                {/* Member Info */}
                {selectedPhoto.members && (
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/10">
                    {selectedPhoto.members.avatar_url && (
                      <div className="relative w-10 h-10 rounded-full border border-white/20 overflow-hidden">
                          <Image
                            src={getActiveImageUrl(selectedPhoto.members.avatar_url)}
                            alt={selectedPhoto.members.name}
                            fill
                            className="object-cover"
                          />
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-white/50">Uploaded by</p>
                      <p className="font-medium text-white">{selectedPhoto.members.name}</p>
                    </div>
                  </div>
                )}

                <p className="mt-4 text-[10px] text-white/30">
                  Use ← → to browse, ESC to close.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
