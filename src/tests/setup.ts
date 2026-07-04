import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

Object.defineProperty(window, 'ResizeObserver', { value: ResizeObserverMock });
Object.defineProperty(window, 'matchMedia', {
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

if (!URL.createObjectURL) {
  Object.defineProperty(URL, 'createObjectURL', { value: () => 'blob:test' });
}

if (!URL.revokeObjectURL) {
  Object.defineProperty(URL, 'revokeObjectURL', { value: () => undefined });
}
