/**
 * Jest Test Setup
 *
 * This file runs before all tests to set up the testing environment
 */

import '@testing-library/jest-dom';

// Mock fetch API for Node environment
global.fetch = jest.fn() as any;

// Mock environment variables for tests
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-project.firebaseapp.com';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id';

// Suppress console warnings in tests (optional)
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = jest.fn((...args) => {
    // Filter out specific warnings you want to ignore
    const message = args[0];
    if (typeof message === 'string' && message.includes('Warning: ReactDOM.render')) {
      return;
    }
    originalWarn(...args);
  });

  console.error = jest.fn((...args) => {
    // Filter out specific errors you want to ignore in tests
    const message = args[0];
    if (typeof message === 'string' && message.includes('Not implemented: HTMLFormElement.prototype.submit')) {
      return;
    }
    originalError(...args);
  });
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;
