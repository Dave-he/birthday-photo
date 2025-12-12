import { render, screen } from '@testing-library/react'
import Home from '../app/page'

// Mock the Scene component because it uses Canvas/Three.js which is hard to test in jsdom
jest.mock('@/components/Scene', () => {
  return function MockScene() {
    return <div data-testid="scene-component">3D Scene</div>
  }
})

describe('Home', () => {
  it('renders the scene component', () => {
    render(<Home />)

    const scene = screen.getByTestId('scene-component')

    expect(scene).toBeInTheDocument()
    expect(scene).toHaveTextContent('3D Scene')
  })
})
