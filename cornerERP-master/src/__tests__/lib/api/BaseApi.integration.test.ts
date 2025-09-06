import '@testing-library/jest-dom';
import { server } from '@/test-utils/msw-server';
import { http, HttpResponse } from 'msw';
import { BaseAPI, QueryParamsBuilder } from '@/lib/api/BaseApi';
import { api } from '@/store/api/api';

// Enhanced test API for integration testing
const TestEntityApi = BaseAPI.createEntityApi<{
	id: string;
	name: string;
	status: string;
	createdAt: string;
	metadata?: Record<string, unknown>;
}>('TestEntity', 'test-entities', {
	providesTags: ['TestEntity'],
	allowedParams: ['search', 'status', 'dateFrom', 'dateTo', 'ids'],
	specialEndpoints: {
		bulk: {
			path: 'bulk-action',
			method: 'POST'
		},
		summary: {
			path: 'summary',
			method: 'GET'
		}
	}
});

// Test API with all features
const FullFeatureApi = api.injectEndpoints({
	endpoints: (build) => ({
		...BaseAPI.createEntityApi('FullFeature', 'full-features', {
			providesTags: ['FullFeature'],
			allowedParams: ['search', 'category', 'tags', 'active']
		}),
		// Custom endpoints
		customAction: build.mutation({
			query: (data) => ({
				url: '/api/supabase/full-features/custom',
				method: 'POST',
				body: data
			}),
			invalidatesTags: ['FullFeature']
		})
	})
});

describe('BaseAPI Integration Tests', () => {
	beforeAll(() => server.listen());
	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	describe('CRUD Operations', () => {
		it('should handle GET requests with query parameters', async () => {
			const mockData = [
				{ id: '1', name: 'Test 1', status: 'active', createdAt: '2024-01-01' },
				{ id: '2', name: 'Test 2', status: 'inactive', createdAt: '2024-01-02' }
			];

			server.use(
				http.get('/api/supabase/test-entities', ({ request }) => {
					const url = new URL(request.url);
					const status = url.searchParams.get('status');

					const filtered = status ? mockData.filter((item) => item.status === status) : mockData;

					return HttpResponse.json({
						data: filtered,
						totalCount: filtered.length
					});
				})
			);

			// Test without filters
			const allResult = await TestEntityApi.endpoints.getTestEntities.initiate({}).unwrap();

			expect(allResult.data).toHaveLength(2);
			expect(allResult.totalCount).toBe(2);

			// Test with status filter
			const activeResult = await TestEntityApi.endpoints.getTestEntities.initiate({ status: 'active' }).unwrap();

			expect(activeResult.data).toHaveLength(1);
			expect(activeResult.data[0].status).toBe('active');
		});

		it('should handle POST requests with data transformation', async () => {
			const newEntity = {
				name: 'New Test Entity',
				status: 'pending'
			};

			server.use(
				http.post('/api/supabase/test-entities', async ({ request }) => {
					const body = await request.json();
					return HttpResponse.json({
						id: 'new-id',
						...body,
						createdAt: new Date().toISOString()
					});
				})
			);

			const result = await TestEntityApi.endpoints.createTestEntity.initiate(newEntity).unwrap();

			expect(result.id).toBe('new-id');
			expect(result.name).toBe(newEntity.name);
			expect(result.status).toBe(newEntity.status);
			expect(result.createdAt).toBeTruthy();
		});

		it('should handle PUT requests for updates', async () => {
			const entityId = 'test-id';
			const updates = {
				name: 'Updated Name',
				status: 'active'
			};

			server.use(
				http.put(`/api/supabase/test-entities/${entityId}`, async ({ request }) => {
					const body = await request.json();
					return HttpResponse.json({
						id: entityId,
						...body,
						updatedAt: new Date().toISOString()
					});
				})
			);

			const result = await TestEntityApi.endpoints.updateTestEntity
				.initiate({ id: entityId, ...updates })
				.unwrap();

			expect(result.id).toBe(entityId);
			expect(result.name).toBe(updates.name);
			expect(result.status).toBe(updates.status);
		});

		it('should handle DELETE requests', async () => {
			const entityId = 'delete-id';

			server.use(
				http.delete(`/api/supabase/test-entities/${entityId}`, () => {
					return HttpResponse.json({ success: true });
				})
			);

			const result = await TestEntityApi.endpoints.deleteTestEntity.initiate(entityId).unwrap();

			expect(result.success).toBe(true);
		});

		it('should handle GET by ID requests', async () => {
			const entityId = 'get-id';
			const mockEntity = {
				id: entityId,
				name: 'Test Entity',
				status: 'active',
				createdAt: '2024-01-01'
			};

			server.use(
				http.get(`/api/supabase/test-entities/${entityId}`, () => {
					return HttpResponse.json(mockEntity);
				})
			);

			const result = await TestEntityApi.endpoints.getTestEntityById.initiate(entityId).unwrap();

			expect(result).toEqual(mockEntity);
		});
	});

	describe('QueryParamsBuilder', () => {
		it('should build query strings correctly', () => {
			const builder = new QueryParamsBuilder();

			// Test single values
			builder.add('search', 'test query');
			builder.add('status', 'active');

			const queryString = builder.build();
			expect(queryString).toContain('search=test%20query');
			expect(queryString).toContain('status=active');
		});

		it('should handle array parameters', () => {
			const builder = new QueryParamsBuilder();

			// Test array values
			builder.addArray('ids', ['1', '2', '3']);
			builder.addArray('tags', ['tag1', 'tag2']);

			const queryString = builder.build();
			expect(queryString).toContain('ids=1&ids=2&ids=3');
			expect(queryString).toContain('tags=tag1&tags=tag2');
		});

		it('should handle date range parameters', () => {
			const builder = new QueryParamsBuilder();

			builder.addDateRange('2024-01-01', '2024-12-31');

			const queryString = builder.build();
			expect(queryString).toContain('dateFrom=2024-01-01');
			expect(queryString).toContain('dateTo=2024-12-31');
		});

		it('should handle pagination parameters', () => {
			const builder = new QueryParamsBuilder();

			builder.addPagination(2, 50);

			const queryString = builder.build();
			expect(queryString).toContain('page=2');
			expect(queryString).toContain('pageSize=50');
		});

		it('should filter out undefined and empty values', () => {
			const builder = new QueryParamsBuilder();

			builder.add('defined', 'value');
			builder.add('undefined', undefined);
			builder.add('empty', '');
			builder.add('null', null);

			const queryString = builder.build();
			expect(queryString).toContain('defined=value');
			expect(queryString).not.toContain('undefined');
			expect(queryString).not.toContain('empty');
			expect(queryString).not.toContain('null');
		});
	});

	describe('Special Endpoints', () => {
		it('should handle special endpoints correctly', async () => {
			const bulkData = {
				action: 'activate',
				ids: ['1', '2', '3']
			};

			server.use(
				http.post('/api/supabase/test-entities/bulk-action', async ({ request }) => {
					const body = await request.json();
					return HttpResponse.json({
						success: true,
						affected: body.ids.length
					});
				})
			);

			// Manually call the special endpoint
			const response = await fetch('/api/supabase/test-entities/bulk-action', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(bulkData)
			});

			const result = await response.json();
			expect(result.success).toBe(true);
			expect(result.affected).toBe(3);
		});

		it('should handle GET special endpoints', async () => {
			const summaryData = {
				total: 100,
				active: 75,
				inactive: 25
			};

			server.use(
				http.get('/api/supabase/test-entities/summary', () => {
					return HttpResponse.json(summaryData);
				})
			);

			const response = await fetch('/api/supabase/test-entities/summary');
			const result = await response.json();

			expect(result).toEqual(summaryData);
		});
	});

	describe('Error Handling', () => {
		it('should handle 404 errors', async () => {
			server.use(
				http.get('/api/supabase/test-entities/non-existent', () => {
					return HttpResponse.json({ message: 'Entity not found' }, { status: 404 });
				})
			);

			try {
				await TestEntityApi.endpoints.getTestEntityById.initiate('non-existent').unwrap();
				fail('Should have thrown an error');
			} catch (error: unknown) {
				expect(error.status).toBe(404);
				expect(error.data.message).toBe('Entity not found');
			}
		});

		it('should handle validation errors', async () => {
			server.use(
				http.post('/api/supabase/test-entities', () => {
					return HttpResponse.json(
						{
							message: 'Validation failed',
							errors: {
								name: 'Name is required',
								status: 'Invalid status value'
							}
						},
						{ status: 400 }
					);
				})
			);

			try {
				await TestEntityApi.endpoints.createTestEntity.initiate({}).unwrap();
				fail('Should have thrown an error');
			} catch (error: unknown) {
				expect(error.status).toBe(400);
				expect(error.data.message).toBe('Validation failed');
				expect(error.data.errors).toBeTruthy();
			}
		});

		it('should handle server errors', async () => {
			server.use(
				http.get('/api/supabase/test-entities', () => {
					return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
				})
			);

			try {
				await TestEntityApi.endpoints.getTestEntities.initiate({}).unwrap();
				fail('Should have thrown an error');
			} catch (error: unknown) {
				expect(error.status).toBe(500);
				expect(error.data.message).toBe('Internal server error');
			}
		});
	});

	describe('Complex Query Scenarios', () => {
		it('should handle multiple filters simultaneously', async () => {
			server.use(
				http.get('/api/supabase/test-entities', ({ request }) => {
					const url = new URL(request.url);
					const search = url.searchParams.get('search');
					const status = url.searchParams.get('status');
					const dateFrom = url.searchParams.get('dateFrom');
					const dateTo = url.searchParams.get('dateTo');

					// Mock filtering logic
					let data = [
						{ id: '1', name: 'Test Item 1', status: 'active', createdAt: '2024-01-15' },
						{ id: '2', name: 'Test Item 2', status: 'inactive', createdAt: '2024-02-15' },
						{ id: '3', name: 'Another Item', status: 'active', createdAt: '2024-03-15' }
					];

					if (search) {
						data = data.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
					}

					if (status) {
						data = data.filter((item) => item.status === status);
					}

					if (dateFrom && dateTo) {
						data = data.filter((item) => item.createdAt >= dateFrom && item.createdAt <= dateTo);
					}

					return HttpResponse.json({ data, totalCount: data.length });
				})
			);

			const result = await TestEntityApi.endpoints.getTestEntities
				.initiate({
					search: 'test',
					status: 'active',
					dateFrom: '2024-01-01',
					dateTo: '2024-02-28'
				})
				.unwrap();

			expect(result.data).toHaveLength(1);
			expect(result.data[0].name).toBe('Test Item 1');
		});

		it('should handle array parameters in queries', async () => {
			server.use(
				http.get('/api/supabase/test-entities', ({ request }) => {
					const url = new URL(request.url);
					const ids = url.searchParams.getAll('ids');

					const allData = [
						{ id: '1', name: 'Item 1' },
						{ id: '2', name: 'Item 2' },
						{ id: '3', name: 'Item 3' },
						{ id: '4', name: 'Item 4' }
					];

					const data = ids.length > 0 ? allData.filter((item) => ids.includes(item.id)) : allData;

					return HttpResponse.json({ data, totalCount: data.length });
				})
			);

			const result = await TestEntityApi.endpoints.getTestEntities.initiate({ ids: ['1', '3'] }).unwrap();

			expect(result.data).toHaveLength(2);
			expect(result.data.map((item) => item.id)).toEqual(['1', '3']);
		});
	});

	describe('Performance and Optimization', () => {
		it('should handle large datasets with pagination', async () => {
			const totalItems = 1000;
			const pageSize = 50;

			server.use(
				http.get('/api/supabase/test-entities', ({ request }) => {
					const url = new URL(request.url);
					const page = parseInt(url.searchParams.get('page') || '1');
					const size = parseInt(url.searchParams.get('pageSize') || '20');

					const start = (page - 1) * size;
					const end = start + size;

					const data = Array.from({ length: size }, (_, i) => ({
						id: `${start + i + 1}`,
						name: `Item ${start + i + 1}`,
						status: i % 2 === 0 ? 'active' : 'inactive',
						createdAt: new Date(2024, 0, start + i + 1).toISOString()
					}));

					return HttpResponse.json({
						data: data.slice(0, Math.min(size, totalItems - start)),
						totalCount: totalItems
					});
				})
			);

			// Test first page
			const firstPage = await TestEntityApi.endpoints.getTestEntities.initiate({ page: 1, pageSize }).unwrap();

			expect(firstPage.data).toHaveLength(pageSize);
			expect(firstPage.totalCount).toBe(totalItems);
			expect(firstPage.data[0].id).toBe('1');

			// Test middle page
			const middlePage = await TestEntityApi.endpoints.getTestEntities.initiate({ page: 10, pageSize }).unwrap();

			expect(middlePage.data).toHaveLength(pageSize);
			expect(middlePage.data[0].id).toBe('451');

			// Test last page
			const lastPage = await TestEntityApi.endpoints.getTestEntities.initiate({ page: 20, pageSize }).unwrap();

			expect(lastPage.data).toHaveLength(pageSize);
			expect(lastPage.data[0].id).toBe('951');
		});
	});

	describe('Backward Compatibility', () => {
		it('should maintain compatibility with existing hooks', async () => {
			// Test that the generated hooks work as expected
			const hooks = {
				useGetTestEntitiesQuery: TestEntityApi.endpoints.getTestEntities.useQuery,
				useCreateTestEntityMutation: TestEntityApi.endpoints.createTestEntity.useMutation,
				useUpdateTestEntityMutation: TestEntityApi.endpoints.updateTestEntity.useMutation,
				useDeleteTestEntityMutation: TestEntityApi.endpoints.deleteTestEntity.useMutation,
				useGetTestEntityByIdQuery: TestEntityApi.endpoints.getTestEntityById.useQuery
			};

			// Verify all hooks are defined
			Object.entries(hooks).forEach(([name, hook]) => {
				expect(hook).toBeDefined();
				expect(typeof hook).toBe('function');
			});
		});

		it('should support custom endpoints alongside BaseAPI', async () => {
			const customData = { custom: 'response' };

			server.use(
				http.post('/api/supabase/full-features/custom', async ({ request }) => {
					const body = await request.json();
					return HttpResponse.json({ ...customData, ...body });
				})
			);

			const result = await FullFeatureApi.endpoints.customAction.initiate({ test: 'data' }).unwrap();

			expect(result.custom).toBe('response');
			expect(result.test).toBe('data');
		});
	});
});
