import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AuthProvider } from '@/contexts/AuthContext';
// import theme from '@/configs/theme';
// import api from '@/store/api';

// Temporary minimal theme and api mocks for testing
const theme = {
	palette: {
		mode: 'light',
		primary: { main: '#1976d2' },
		secondary: { main: '#dc004e' }
	}
};

const api = {
	reducer: (state = {}, action: { type: string }) => state,
	middleware: [] as unknown[]
};
import { User } from '@auth/user';

// Mock user for testing
export const mockUser: User = {
	id: 'test-user',
	displayName: 'Test User',
	email: 'test@example.com',
	roles: ['user'],
	photoUrl: '',
	title: 'Test Title',
	startOfDuty: '2024-01-01',
	endOfDuty: undefined
};

// Mock auth context value
export const mockAuthContextValue = {
	user: mockUser,
	session: {
		access_token: 'mock-access-token',
		refresh_token: 'mock-refresh-token',
		expires_at: Date.now() + 3600000,
		token_type: 'bearer',
		user: {
			id: 'test-id',
			email: 'test@example.com'
		}
	},
	loading: false,
	signIn: jest.fn(),
	signOut: jest.fn(),
	refreshSession: jest.fn()
};

// Create a mock store
export const createMockStore = (preloadedState = {}) => {
	return configureStore({
		reducer: {
			api: api.reducer
		},
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				serializableCheck: false
			}).concat(api.middleware),
		preloadedState
	});
};

interface AllTheProvidersProps {
	children: ReactNode;
	authValue?: typeof mockAuthContextValue;
}

// Custom provider that wraps components with all necessary providers
const AllTheProviders = ({ children, authValue = mockAuthContextValue }: AllTheProvidersProps) => {
	const store = createMockStore();

	return (
		<Provider store={store}>
			<AuthProvider>
				<ThemeProvider theme={theme}>{children}</ThemeProvider>
			</AuthProvider>
		</Provider>
	);
};

// Custom render method
const customRender = (
	ui: ReactElement,
	options?: Omit<RenderOptions, 'wrapper'> & { authValue?: typeof mockAuthContextValue }
) => {
	const { authValue, ...renderOptions } = options || {};

	return render(ui, {
		wrapper: ({ children }) => <AllTheProviders authValue={authValue}>{children}</AllTheProviders>,
		...renderOptions
	});
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Utility functions for common test scenarios
export const waitForLoadingToFinish = () => {
	return new Promise((resolve) => setTimeout(resolve, 0));
};

export const createMockResponse = <T,>(data: T, status = 200) => {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json'
		}
	});
};
