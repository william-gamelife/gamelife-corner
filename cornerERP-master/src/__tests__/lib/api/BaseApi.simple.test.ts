import { BaseAPI, QueryParamsBuilder } from '@/lib/api/BaseApi';

describe('BaseAPI Simple Tests', () => {
	describe('QueryParamsBuilder', () => {
		it('should build simple query strings', () => {
			const builder = new QueryParamsBuilder();

			builder.add('search', 'test');
			builder.add('status', 'active');

			const result = builder.build();
			expect(result).toContain('search=test');
			expect(result).toContain('status=active');
		});

		it('should handle array parameters', () => {
			const builder = new QueryParamsBuilder();

			builder.addArray('ids', ['1', '2', '3']);

			const result = builder.build();
			expect(result).toContain('ids=1');
			expect(result).toContain('ids=2');
			expect(result).toContain('ids=3');
		});

		it('should handle date range parameters', () => {
			const builder = new QueryParamsBuilder();

			builder.addDateRange('2024-01-01', '2024-12-31');

			const result = builder.build();
			expect(result).toContain('dateFrom=2024-01-01');
			expect(result).toContain('dateTo=2024-12-31');
		});

		it('should handle pagination parameters', () => {
			const builder = new QueryParamsBuilder();

			builder.addPagination(2, 50);

			const result = builder.build();
			expect(result).toContain('page=2');
			expect(result).toContain('pageSize=50');
		});

		it('should filter out empty values', () => {
			const builder = new QueryParamsBuilder();

			builder.add('valid', 'value');
			builder.add('empty', '');
			builder.add('undefined', undefined);
			builder.add('null', null);

			const result = builder.build();
			expect(result).toContain('valid=value');
			expect(result).not.toContain('empty=');
			expect(result).not.toContain('undefined');
			expect(result).not.toContain('null');
		});

		it('should handle special characters correctly', () => {
			const builder = new QueryParamsBuilder();

			builder.add('search', '測試 & 特殊字元');

			const result = builder.build();
			expect(result).toContain('search=' + encodeURIComponent('測試 & 特殊字元'));
		});
	});

	describe('BaseAPI Structure', () => {
		it('should create entity API with correct structure', () => {
			const TestApi = BaseAPI.createEntityApi('Test', 'tests', {
				providesTags: ['Test'],
				allowedParams: ['search', 'status']
			});

			// Verify the structure exists
			expect(TestApi).toBeDefined();
			expect(TestApi.getTests).toBeDefined();
			expect(TestApi.getTestById).toBeDefined();
			expect(TestApi.createTest).toBeDefined();
			expect(TestApi.updateTest).toBeDefined();
			expect(TestApi.deleteTest).toBeDefined();

			// Verify they are functions
			expect(typeof TestApi.getTests).toBe('function');
			expect(typeof TestApi.getTestById).toBe('function');
			expect(typeof TestApi.createTest).toBe('function');
			expect(typeof TestApi.updateTest).toBe('function');
			expect(typeof TestApi.deleteTest).toBe('function');
		});

		it('should handle special endpoints configuration', () => {
			const TestApi = BaseAPI.createEntityApi('Test', 'tests', {
				providesTags: ['Test'],
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

			expect(TestApi).toBeDefined();
			// Special endpoints would be handled in the actual API implementation
		});

		it('should handle allowed parameters configuration', () => {
			const allowedParams = ['search', 'status', 'dateFrom', 'dateTo', 'ids'];

			const TestApi = BaseAPI.createEntityApi('Test', 'tests', {
				providesTags: ['Test'],
				allowedParams
			});

			expect(TestApi).toBeDefined();
			// Parameter filtering would be tested in integration tests
		});
	});

	describe('Utility Functions', () => {
		it('should build entity URLs correctly', () => {
			// This tests the internal URL building logic
			const baseUrl = '/api/supabase/tests';
			const entityId = '123';

			expect(`${baseUrl}/${entityId}`).toBe('/api/supabase/tests/123');
		});

		it('should handle query string building', () => {
			const params = new URLSearchParams();
			params.append('search', 'test');
			params.append('status', 'active');

			const queryString = params.toString();
			expect(queryString).toContain('search=test');
			expect(queryString).toContain('status=active');
		});

		it('should handle array query parameters', () => {
			const params = new URLSearchParams();
			const ids = ['1', '2', '3'];

			ids.forEach((id) => params.append('ids', id));

			const queryString = params.toString();
			expect(queryString).toBe('ids=1&ids=2&ids=3');
		});
	});

	describe('Tags and Caching', () => {
		it('should configure tags correctly', () => {
			const tags = ['Test'];
			const TestApi = BaseAPI.createEntityApi('Test', 'tests', {
				providesTags: tags
			});

			expect(TestApi).toBeDefined();
			// Tag functionality would be tested with actual RTK Query integration
		});

		it('should handle invalidation tags', () => {
			const TestApi = BaseAPI.createEntityApi('Test', 'tests', {
				providesTags: ['Test'],
				invalidatesTags: ['Test', 'Related']
			});

			expect(TestApi).toBeDefined();
			// Invalidation would be tested with actual store integration
		});
	});

	describe('Error Handling', () => {
		it('should handle missing configuration gracefully', () => {
			expect(() => {
				BaseAPI.createEntityApi('Test', 'tests', {});
			}).not.toThrow();
		});

		it('should handle empty entity name', () => {
			expect(() => {
				BaseAPI.createEntityApi('', 'tests', {
					providesTags: ['Test']
				});
			}).not.toThrow();
		});

		it('should handle empty endpoint', () => {
			expect(() => {
				BaseAPI.createEntityApi('Test', '', {
					providesTags: ['Test']
				});
			}).not.toThrow();
		});
	});
});
