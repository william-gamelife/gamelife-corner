import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
	// Provide the path to your Next.js app to load next.config.js and .env files in your test environment
	dir: './'
})

// Add any custom config to be passed to Jest
const customJestConfig = {
	// Add more setup options before each test is run
	setupFilesAfterEnv: ['<rootDir>/jest.setup.simple.js'],
	// if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
	moduleDirectories: ['node_modules', '<rootDir>/'],
	testEnvironment: 'jest-environment-jsdom',
	testEnvironmentOptions: {
		customExportConditions: ['']
	},
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
		'^@auth/(.*)$': '<rootDir>/src/@auth/$1',
		'^@fuse/(.*)$': '<rootDir>/src/@fuse/$1',
		'^@i18n(.*)$': '<rootDir>/src/@i18n$1',
		'^@history(.*)$': '<rootDir>/src/@history$1',
		'^@schema(.*)$': '<rootDir>/src/@schema$1'
	},
	testMatch: [
		'**/__tests__/**/*.[jt]s?(x)',
		'**/?(*.)+(spec|test).[jt]s?(x)'
	],
	collectCoverageFrom: [
		'src/**/*.{js,jsx,ts,tsx}',
		'!src/**/*.d.ts',
		'!src/@fuse/**',
		'!src/@i18n/**',
		'!src/@history/**'
	],
	coverageThreshold: {
		global: {
			branches: 0,
			functions: 0,
			lines: 0,
			statements: 0
		}
	}
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig)