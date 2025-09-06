// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import 'whatwg-fetch'
import { TextEncoder, TextDecoder } from 'util'

// Add TextEncoder/TextDecoder polyfills for jsdom
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// MSW Server Setup
import { server } from './src/test-utils/msw-server'

// Establish API mocking before all tests.
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished.
afterAll(() => server.close())

// Mock Next.js router
jest.mock('next/navigation', () => ({
	useRouter() {
		return {
			push: jest.fn(),
			back: jest.fn(),
			forward: jest.fn(),
			refresh: jest.fn(),
			replace: jest.fn(),
			prefetch: jest.fn()
		}
	},
	usePathname() {
		return ''
	},
	useParams() {
		return {}
	},
	useSearchParams() {
		return new URLSearchParams()
	}
}))

// Mock Next.js server components
jest.mock('next/server', () => ({
	NextRequest: class NextRequest {
		constructor(url, init = {}) {
			this.url = url
			this.method = init.method || 'GET'
			this.headers = new Map(Object.entries(init.headers || {}))
			this.nextUrl = new URL(url)
			if (init.body) {
				this.body = init.body
			}
		}
		async json() {
			return JSON.parse(this.body)
		}
	},
	NextResponse: {
		json: (data, init) => ({
			ok: true,
			status: init?.status || 200,
			headers: new Map(Object.entries(init?.headers || {})),
			json: async () => data
		})
	}
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: jest.fn().mockImplementation(query => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(), // deprecated
		removeListener: jest.fn(), // deprecated
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn()
	}))
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
	constructor() {}
	disconnect() {}
	observe() {}
	unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
	constructor() {}
	observe() {}
	unobserve() {}
	disconnect() {}
}

// Mock crypto for Supabase
Object.defineProperty(window, 'crypto', {
	value: {
		getRandomValues: arr => {
			for (let i = 0; i < arr.length; i++) {
				arr[i] = Math.floor(Math.random() * 256)
			}
			return arr
		}
	}
})

// Suppress console errors in tests
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
	console.error = jest.fn((...args) => {
		if (
			typeof args[0] === 'string' &&
			(args[0].includes('Warning: ReactDOM.render') ||
				args[0].includes('Warning: `ReactDOMTestUtils.act`') ||
				args[0].includes('Warning: Failed prop type') ||
				args[0].includes('An unhandled error occurred processing'))
		) {
			return
		}
		originalError.call(console, ...args)
	})

	console.warn = jest.fn((...args) => {
		if (
			typeof args[0] === 'string' &&
			(args[0].includes('Warning: ') || args[0].includes('act()'))
		) {
			return
		}
		originalWarn.call(console, ...args)
	})
})

afterAll(() => {
	console.error = originalError
	console.warn = originalWarn
})