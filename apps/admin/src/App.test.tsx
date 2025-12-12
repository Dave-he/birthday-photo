import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock Supabase client
vi.mock('./utility/supabaseClient', () => ({
  supabaseClient: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        data: [],
        error: null,
      })),
    })),
  },
}));

// Mock @refinedev/antd
vi.mock('@refinedev/antd', () => ({
  ThemedLayout: ({ children }: any) => <div>{children}</div>,
  ErrorComponent: () => <div>Error</div>,
  RefineThemes: { Blue: {} },
  useNotificationProvider: vi.fn(),
}));

// Mock @refinedev/react-router-v6
vi.mock('@refinedev/react-router-v6', () => ({
  default: vi.fn(),
  NavigateToResource: () => <div>NavigateToResource</div>,
  UnsavedChangesNotifier: () => null,
  DocumentTitleHandler: () => null,
}));

// Mock window.matchMedia for Ant Design
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock @refinedev/core
vi.mock('@refinedev/core', async () => {
  const actual = await vi.importActual('@refinedev/core');
  return {
    ...actual,
    useResource: vi.fn(() => ({ resources: [] })),
    useTranslate: vi.fn(() => (key: string) => key),
  };
});

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });
});
