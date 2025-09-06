import { QueryParamsBuilder } from '@/lib/api/BaseApi';

describe('BaseAPI 工具函數測試', () => {
	describe('QueryParamsBuilder', () => {
		describe('toURLSearchParams', () => {
			it('應該正確處理基本參數', () => {
				const params = {
					query: 'test',
					limit: 10,
					active: true
				};

				const result = QueryParamsBuilder.toURLSearchParams(params);

				expect(result.get('query')).toBe('test');
				expect(result.get('limit')).toBe('10');
				expect(result.get('active')).toBe('true');
			});

			it('應該正確處理陣列參數', () => {
				const params = {
					status: [1, 2, 3],
					types: ['order', 'receipt']
				};

				const result = QueryParamsBuilder.toURLSearchParams(params);

				expect(result.getAll('status')).toEqual(['1', '2', '3']);
				expect(result.getAll('types')).toEqual(['order', 'receipt']);
			});

			it('應該忽略 null 和 undefined 值', () => {
				const params = {
					query: 'test',
					limit: null,
					offset: undefined,
					active: true
				};

				const result = QueryParamsBuilder.toURLSearchParams(params);

				expect(result.has('limit')).toBe(false);
				expect(result.has('offset')).toBe(false);
				expect(result.get('query')).toBe('test');
				expect(result.get('active')).toBe('true');
			});

			it('應該處理混合類型的陣列', () => {
				const params = {
					ids: [1, 2, null, 3, undefined],
					codes: ['A', null, 'B']
				};

				const result = QueryParamsBuilder.toURLSearchParams(params);

				expect(result.getAll('ids')).toEqual(['1', '2', '3']);
				expect(result.getAll('codes')).toEqual(['A', 'B']);
			});
		});

		describe('toQueryString', () => {
			it('應該返回正確的查詢字串', () => {
				const params = {
					query: 'test search',
					limit: 20,
					status: [1, 2]
				};

				const result = QueryParamsBuilder.toQueryString(params);

				expect(result).toContain('?');
				expect(result).toContain('query=test+search');
				expect(result).toContain('limit=20');
				expect(result).toContain('status=1');
				expect(result).toContain('status=2');
			});

			it('應該處理空參數返回空字串', () => {
				const result1 = QueryParamsBuilder.toQueryString({});
				const result2 = QueryParamsBuilder.toQueryString({ value: null });

				expect(result1).toBe('');
				expect(result2).toBe('');
			});

			it('應該正確編碼特殊字元', () => {
				const params = {
					query: 'test with spaces & symbols',
					email: 'test@example.com'
				};

				const result = QueryParamsBuilder.toQueryString(params);

				expect(result).toContain('test+with+spaces+%26+symbols');
				expect(result).toContain('test%40example.com');
			});
		});

		describe('processSpecialArrays', () => {
			it('應該將指定欄位的陣列轉換為 JSON 字串', () => {
				const params = {
					query: 'test',
					status: [1, 2, 3],
					types: ['A', 'B'],
					limit: 10
				};

				const result = QueryParamsBuilder.processSpecialArrays(params, ['status']);

				expect(result.query).toBe('test');
				expect(result.status).toBe('[1,2,3]');
				expect(result.types).toEqual(['A', 'B']); // 不處理
				expect(result.limit).toBe(10);
			});

			it('應該處理多個陣列欄位', () => {
				const params = {
					status: [1, 2],
					types: ['A', 'B'],
					categories: ['cat1', 'cat2']
				};

				const result = QueryParamsBuilder.processSpecialArrays(params, ['status', 'categories']);

				expect(result.status).toBe('[1,2]');
				expect(result.categories).toBe('["cat1","cat2"]');
				expect(result.types).toEqual(['A', 'B']); // 不處理
			});

			it('應該忽略非陣列的欄位', () => {
				const params = {
					status: 'single',
					types: ['A', 'B'],
					number: 123
				};

				const result = QueryParamsBuilder.processSpecialArrays(params, ['status']);

				expect(result.status).toBe('single'); // 保持不變
				expect(result.types).toEqual(['A', 'B']);
				expect(result.number).toBe(123);
			});

			it('應該處理空陣列欄位列表', () => {
				const params = {
					status: [1, 2, 3],
					query: 'test'
				};

				const result = QueryParamsBuilder.processSpecialArrays(params, []);

				expect(result).toEqual(params); // 應該完全相同
			});

			it('應該處理不存在的欄位', () => {
				const params = {
					query: 'test',
					limit: 10
				};

				const result = QueryParamsBuilder.processSpecialArrays(params, ['nonexistent']);

				expect(result).toEqual(params); // 應該完全相同
			});
		});
	});

	describe('整合測試', () => {
		it('應該處理複雜的查詢參數場景', () => {
			const params = {
				query: 'search term',
				status: [1, 2, 3],
				active: true,
				limit: 50,
				dateFrom: '2024-01-01',
				dateTo: null,
				categories: ['A', 'B', 'C']
			};

			// 先處理特殊陣列
			const processed = QueryParamsBuilder.processSpecialArrays(params, ['status']);

			// 再生成查詢字串
			const queryString = QueryParamsBuilder.toQueryString(processed);

			expect(processed.status).toBe('[1,2,3]');
			expect(queryString).toContain('status=%5B1%2C2%2C3%5D'); // URL encoded JSON
			expect(queryString).toContain('categories=A');
			expect(queryString).toContain('categories=B');
			expect(queryString).toContain('categories=C');
			expect(queryString).toContain('query=search+term');
			expect(queryString).toContain('active=true');
			expect(queryString).toContain('limit=50');
			expect(queryString).not.toContain('dateTo'); // null 值應被忽略
		});

		it('應該處理 ReceiptApi 類型的查詢參數', () => {
			const receiptParams = {
				receiptNumber: 'R001',
				status: [0, 1],
				dateFrom: '2024-01-01',
				dateTo: '2024-12-31',
				orderNumber: 'O001'
			};

			// 模擬 ReceiptApi 的參數處理邏輯
			const processed = QueryParamsBuilder.processSpecialArrays(receiptParams, ['status']);
			const queryString = QueryParamsBuilder.toQueryString(processed);

			expect(processed.status).toBe('[0,1]');
			expect(queryString).toContain('receiptNumber=R001');
			expect(queryString).toContain('status=%5B0%2C1%5D');
			expect(queryString).toContain('dateFrom=2024-01-01');
			expect(queryString).toContain('dateTo=2024-12-31');
			expect(queryString).toContain('orderNumber=O001');
		});

		it('應該處理 BillApi 類型的查詢參數', () => {
			const billParams = {
				billNumber: 'B001',
				status: [0, 1, 2],
				dateFrom: '2024-01-01',
				dateTo: '2024-12-31',
				limit: 100
			};

			// 模擬 BillApi 的參數處理邏輯 (使用 JSON.stringify)
			const processed = QueryParamsBuilder.processSpecialArrays(billParams, ['status']);

			expect(processed.status).toBe('[0,1,2]');
			expect(typeof processed.status).toBe('string');
		});
	});
});
