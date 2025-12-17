'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Photo } from '@birthday-photo/data'

// 这里使用Image作为any类型，因为它来自Next.js，在共享包中我们不需要实际导入它
// 在实际使用时，需要从Next.js中导入Image组件并传递给PhotoModal
interface ImageProps {
  src: string
  alt: string
  fill?: boolean
  className?: string
  sizes?: string
}

interface PhotoModalProps {
  selectedPhoto: Photo | null
  onClose: () => void
  Image: React.ComponentType<ImageProps>
}

export default function PhotoModal({ selectedPhoto, onClose, Image }: PhotoModalProps) {
  return (
    <AnimatePresence>
      {selectedPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            className="bg-white/10 border border-white/20 p-6 rounded-2xl max-w-2xl w-full text-white shadow-2xl relative backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-white/50 hover:text-white z-10"
              onClick={onClose}
            >
              ✕
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2 aspect-square relative rounded-lg overflow-hidden border border-white/10 shadow-inner bg-black/20">
                <Image
                  src={selectedPhoto.image_url}
                  alt={selectedPhoto.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className="flex-1 flex flex-col justify-center text-left">
                <h2 className="text-3xl font-serif mb-2 text-amber-300">{selectedPhoto.title}</h2>

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
                            src={selectedPhoto.members.avatar_url}
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
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
