'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Sparkles } from '@react-three/drei'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Tree from './Tree'
import Ornament from './Ornament'
import { AnimatePresence, motion } from 'framer-motion'

interface Photo {
  id: string
  image_url: string
  title: string
  description: string
  position_index: number
}

// Helper to calculate positions on a cone/tree shape
// Spiral distribution
const getPosition = (index: number, total: number): [number, number, number] => {
  const y = 1.5 + (index / total) * 4; // Height from 1.5 to 5.5
  const radius = 2.5 * (1 - (y - 1.5) / 4.5); // Radius decreases as y increases
  const angle = index * 2.4; // Golden angle approx for spiral
  
  return [
    Math.cos(angle) * radius,
    y,
    Math.sin(angle) * radius
  ]
}

export default function Scene() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await supabase
        .from('photos')
        .select('*')
        .order('position_index', { ascending: true })
        .limit(50)
      
      if (data) setPhotos(data)
    }

    fetchPhotos()
  }, [])

  return (
    <>
      <div className="w-full h-screen bg-gradient-to-b from-slate-900 to-black">
        <Canvas camera={{ position: [0, 2, 12], fov: 50 }}>
          <fog attach="fog" args={['#000', 10, 25]} />
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, 5, -10]} intensity={0.5} color="blue" />
          
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Sparkles count={200} scale={10} size={2} speed={0.4} opacity={0.5} color="#fff" />
          
          <OrbitControls 
            enableZoom={true} 
            enablePan={false} 
            maxPolarAngle={Math.PI / 1.5} 
            minPolarAngle={Math.PI / 4}
            autoRotate={!selectedPhoto}
            autoRotateSpeed={0.5}
          />
          
          <Tree />
          
          {photos.map((photo, index) => (
            <Ornament
              key={photo.id}
              id={photo.id}
              position={getPosition(index, photos.length || 1)}
              imageUrl={photo.image_url}
              title={photo.title}
              description={photo.description}
              isSelected={selectedPhoto?.id === photo.id}
              onClick={() => setSelectedPhoto(photo)}
            />
          ))}
        </Canvas>
      </div>

      {/* UI Overlay for Selected Photo */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white/10 border border-white/20 p-6 rounded-2xl max-w-2xl w-full text-white shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-4 right-4 text-white/50 hover:text-white"
                onClick={() => setSelectedPhoto(null)}
              >
                ✕
              </button>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2 aspect-square relative rounded-lg overflow-hidden border border-white/10">
                   <img 
                     src={selectedPhoto.image_url} 
                     alt={selectedPhoto.title} 
                     className="object-cover w-full h-full"
                   />
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                   <h2 className="text-3xl font-serif mb-4 text-amber-300">{selectedPhoto.title}</h2>
                   <p className="text-lg leading-relaxed text-gray-200 font-light italic">
                     "{selectedPhoto.description}"
                   </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
