import '@testing-library/jest-dom';

// ResizeObserver is not implemented in jsdom
window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// RAF/CAF — synchronous stub so tests don't need real timers
let rafId = 0;
window.requestAnimationFrame = (cb: FrameRequestCallback) => {
  const id = ++rafId;
  setTimeout(() => cb(performance.now()), 0);
  return id;
};
window.cancelAnimationFrame = (id: number) => clearTimeout(id);

// matchMedia is not implemented in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// localStorage stub (not available in Node/jsdom without --localstorage-file)
const _localStore: Record<string, string> = {};
Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: {
    getItem:    (k: string) => _localStore[k] ?? null,
    setItem:    (k: string, v: string) => { _localStore[k] = v; },
    removeItem: (k: string) => { delete _localStore[k]; },
    clear:      () => { for (const k in _localStore) delete _localStore[k]; },
    key:        (i: number) => Object.keys(_localStore)[i] ?? null,
    get length() { return Object.keys(_localStore).length; },
  },
});

// Canvas context stub
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  drawImage: vi.fn(),
  measureText: vi.fn().mockReturnValue({ width: 0 }),
}) as unknown as typeof HTMLCanvasElement.prototype.getContext;
