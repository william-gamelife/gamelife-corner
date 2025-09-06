import { http, HttpResponse } from 'msw';

// Define base URL for API mocking
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Mock handlers for common API endpoints
export const handlers = [
	// Auth endpoints
	http.post('/api/supabase/users', () => {
		return HttpResponse.json({
			user: {
				id: 'test-user',
				displayName: 'Test User',
				email: 'test@example.com',
				roles: ['user']
			},
			session: {
				access_token: 'mock-access-token',
				refresh_token: 'mock-refresh-token'
			}
		});
	}),

	http.get('/api/supabase/users/:id', () => {
		return HttpResponse.json({
			id: 'test-user',
			displayName: 'Test User',
			email: 'test@example.com',
			roles: ['user'],
			title: 'Test Title',
			startOfDuty: '2024-01-01'
		});
	}),

	// Orders endpoints
	http.get('/api/supabase/orders', () => {
		return HttpResponse.json({
			data: [
				{
					orderNumber: 'ORD-001',
					groupCode: 'GRP-001',
					customerName: 'Test Customer',
					totalAmount: 10000,
					status: 'confirmed'
				}
			],
			totalCount: 1
		});
	}),

	// Groups endpoints
	http.get('/api/supabase/groups', () => {
		return HttpResponse.json({
			data: [
				{
					groupCode: 'GRP-001',
					groupName: 'Test Group',
					departureDate: '2024-12-01',
					returnDate: '2024-12-10',
					status: 'active'
				}
			],
			totalCount: 1
		});
	}),

	// Receipts endpoints
	http.get('/api/supabase/receipts', () => {
		return HttpResponse.json({
			data: [
				{
					receiptNumber: 'RCP-001',
					orderNumber: 'ORD-001',
					amount: 5000,
					paymentDate: '2024-01-15',
					status: 'paid'
				}
			],
			totalCount: 1
		});
	}),

	// Default handler for unhandled requests
	http.all('*', () => {
		// eslint-disable-next-line no-console
		console.warn('Unhandled request');
		return new HttpResponse(null, { status: 404 });
	})
];

// Utility to create error responses
export const createErrorResponse = (message: string, status = 400) => {
	return HttpResponse.json({ message, error: true }, { status });
};

// Utility to create success responses
export const createSuccessResponse = <T>(data: T) => {
	return HttpResponse.json(data as Record<string, unknown>);
};
