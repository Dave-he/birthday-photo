import { render, screen, fireEvent } from '@testing-library/react'
import SceneHUD from '../components/SceneHUD'
import '@testing-library/jest-dom'

// Mock framer-motion to render children directly
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick }: any) => <div className={className} onClick={onClick}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}))

// Mock supabase
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } })
    },
    from: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      })
    })
  }
}))

describe('SceneHUD', () => {
  const defaultProps = {
    hasStarted: true,
    scenes: [{ id: '1', name: 'Test Scene', created_at: '', description: '', is_featured: false, image_url: '', member_id: '', position_index: 0, scene_id: '', tags: [], title: '' }],
    currentSceneId: '1',
    onSceneChange: jest.fn(),
    mode: 'christmas' as const,
    onModeChange: jest.fn(),
    galleryLayout: 'tree' as const,
    onLayoutChange: jest.fn(),
    settings: { id: '1', greeting_title: 'Hello', bg_music_url: 'music.mp3', created_at: '', is_snowing: true, low_quality_mode: false, particle_multiplier: 1, rotate_speed: 1, snow_density: 1 },
    isPlaying: false,
    onToggleMusic: jest.fn(),
    qualityPreset: 'auto' as const,
    onQualityPresetChange: jest.fn(),
    particleMultiplier: 1,
    onParticleMultiplierChange: jest.fn(),
    rotateSpeed: 1,
    onRotateSpeedChange: jest.fn()
  }

  it('renders settings toggle button', () => {
    render(<SceneHUD {...defaultProps} />)
    const settingsBtn = screen.getByTitle('Settings')
    expect(settingsBtn).toBeInTheDocument()
  })

  it('toggles settings panel', () => {
    render(<SceneHUD {...defaultProps} />)
    const settingsBtn = screen.getByTitle('Settings')
    
    // Initial state: panel not visible (we can't easily check visibility with this mock, but we can check if content exists after click)
    // Actually with the conditional rendering {showSettings && ...}, it shouldn't be in the document.
    expect(screen.queryByText('Performance & Visuals')).not.toBeInTheDocument()

    // Click to open
    fireEvent.click(settingsBtn)
    expect(screen.getByText('Performance & Visuals')).toBeInTheDocument()

    // Check for controls
    expect(screen.getByText('Quality Preset')).toBeInTheDocument()
    expect(screen.getByText('Particles')).toBeInTheDocument()
    expect(screen.getByText('Rotation Speed')).toBeInTheDocument()
  })

  it('calls onQualityPresetChange when preset clicked', () => {
    render(<SceneHUD {...defaultProps} />)
    fireEvent.click(screen.getByTitle('Settings'))
    
    const highBtn = screen.getByText('high')
    fireEvent.click(highBtn)
    
    expect(defaultProps.onQualityPresetChange).toHaveBeenCalledWith('high')
  })
})
