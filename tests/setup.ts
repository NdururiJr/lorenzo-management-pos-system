/**
 * Jest Test Setup
 *
 * This file runs before all tests to set up the testing environment
 */

import '@testing-library/jest-dom';

// Mock fetch API and Response for Node environment
global.fetch = jest.fn() as any;

// Mock Response class for Firebase auth in Node environment
if (typeof Response === 'undefined') {
  global.Response = class Response {
    ok: boolean;
    status: number;
    statusText: string;
    headers: Headers;
    body: ReadableStream | null;
    bodyUsed: boolean;
    redirected: boolean;
    type: ResponseType;
    url: string;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.ok = init?.status ? init.status >= 200 && init.status < 300 : true;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || 'OK';
      this.headers = new Headers(init?.headers);
      this.body = null;
      this.bodyUsed = false;
      this.redirected = false;
      this.type = 'default';
      this.url = '';
    }

    clone(): Response {
      return new Response();
    }

    async json(): Promise<any> {
      return {};
    }

    async text(): Promise<string> {
      return '';
    }

    async arrayBuffer(): Promise<ArrayBuffer> {
      return new ArrayBuffer(0);
    }

    async blob(): Promise<Blob> {
      return new Blob();
    }

    async formData(): Promise<FormData> {
      return new FormData();
    }
  } as any;
}

// Mock Headers class if not available
if (typeof Headers === 'undefined') {
  global.Headers = class Headers {
    private headers: Map<string, string> = new Map();

    constructor(init?: HeadersInit) {
      if (init) {
        if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.headers.set(key.toLowerCase(), value));
        } else if (init instanceof Headers) {
          init.forEach((value, key) => this.headers.set(key, value));
        } else {
          Object.entries(init).forEach(([key, value]) => this.headers.set(key.toLowerCase(), value));
        }
      }
    }

    get(name: string): string | null {
      return this.headers.get(name.toLowerCase()) || null;
    }

    set(name: string, value: string): void {
      this.headers.set(name.toLowerCase(), value);
    }

    has(name: string): boolean {
      return this.headers.has(name.toLowerCase());
    }

    delete(name: string): void {
      this.headers.delete(name.toLowerCase());
    }

    forEach(callback: (value: string, key: string, parent: Headers) => void): void {
      this.headers.forEach((value, key) => callback(value, key, this));
    }

    append(name: string, value: string): void {
      const existing = this.get(name);
      this.set(name, existing ? `${existing}, ${value}` : value);
    }

    entries(): IterableIterator<[string, string]> {
      return this.headers.entries();
    }

    keys(): IterableIterator<string> {
      return this.headers.keys();
    }

    values(): IterableIterator<string> {
      return this.headers.values();
    }

    [Symbol.iterator](): IterableIterator<[string, string]> {
      return this.headers.entries();
    }
  } as any;
}

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
