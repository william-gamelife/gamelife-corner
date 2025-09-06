import '@testing-library/jest-dom';
import { server } from '@/test-utils/msw-server';
import { http, HttpResponse } from 'msw';
import { QueryParamsBuilder } from '@/lib/api/BaseApi';

// Import APIs that have special query handling
import OrderApi from '@/app/(control-panel)/orders/OrderApi';
import CustomerApi from '@/app/(control-panel)/customers/CustomerApi';
import GroupApi from '@/app/(control-panel)/groups/GroupApi';
import InvoiceApi from '@/app/(control-panel)/invoices/InvoiceApi';
import EsimApi from '@/app/(control-panel)/esims/EsimApi';

describe('Query Parameters Handling Tests', () => {
	beforeAll(() => server.listen());
	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	describe('Array Parameters', () => {
		it('should handle status array parameters', async () => {
			server.use(
				http.get('/api/supabase/orders', ({ request }) => {
					const url = new URL(request.url);
					const statuses = url.searchParams.getAll('status');

					const allOrders = [
						{ id: '1', orderNumber: 'ORD-001', status: 'pending' },
						{ id: '2', orderNumber: 'ORD-002', status: 'confirmed' },
						{ id: '3', orderNumber: 'ORD-003', status: 'cancelled' },
						{ id: '4', orderNumber: 'ORD-004', status: 'pending' }
					];

					const filtered =
						statuses.length > 0 ? allOrders.filter((order) => statuses.includes(order.status)) : allOrders;

					return HttpResponse.json({ data: filtered, totalCount: filtered.length });
				})
			);

			// Test multiple status values
			const result = await OrderApi.endpoints.getOrders.initiate({ status: ['pending', 'confirmed'] }).unwrap();

			expect(result.data).toHaveLength(3);
			expect(result.data.every((order) => ['pending', 'confirmed'].includes(order.status))).toBe(true);
		});

		it('should handle customerIds array parameter', async () => {
			server.use(
				http.get('/api/supabase/orders', ({ request }) => {
					const url = new URL(request.url);
					const customerIds = url.searchParams.getAll('customerIds');

					const orders = [
						{ id: '1', orderNumber: 'ORD-001', customerId: 'cust-1' },
						{ id: '2', orderNumber: 'ORD-002', customerId: 'cust-2' },
						{ id: '3', orderNumber: 'ORD-003', customerId: 'cust-3' },
						{ id: '4', orderNumber: 'ORD-004', customerId: 'cust-1' }
					];

					const filtered =
						customerIds.length > 0
							? orders.filter((order) => customerIds.includes(order.customerId))
							: orders;

					return HttpResponse.json({ data: filtered, totalCount: filtered.length });
				})
			);

			const result = await OrderApi.endpoints.getOrders.initiate({ customerIds: ['cust-1', 'cust-3'] }).unwrap();

			expect(result.data).toHaveLength(3);
			expect(result.data.filter((o) => o.customerId === 'cust-1')).toHaveLength(2);
			expect(result.data.filter((o) => o.customerId === 'cust-3')).toHaveLength(1);
		});

		it('should handle groupCodes array parameter', async () => {
			server.use(
				http.get('/api/supabase/orders', ({ request }) => {
					const url = new URL(request.url);
					const groupCodes = url.searchParams.getAll('groupCodes');

					const orders = [
						{ id: '1', orderNumber: 'ORD-001', groupCode: 'GRP-001' },
						{ id: '2', orderNumber: 'ORD-002', groupCode: 'GRP-002' },
						{ id: '3', orderNumber: 'ORD-003', groupCode: 'GRP-001' },
						{ id: '4', orderNumber: 'ORD-004', groupCode: 'GRP-003' }
					];

					const filtered =
						groupCodes.length > 0 ? orders.filter((order) => groupCodes.includes(order.groupCode)) : orders;

					return HttpResponse.json({ data: filtered, totalCount: filtered.length });
				})
			);

			const result = await OrderApi.endpoints.getOrders.initiate({ groupCodes: ['GRP-001', 'GRP-002'] }).unwrap();

			expect(result.data).toHaveLength(3);
		});
	});

	describe('Date Range Parameters', () => {
		it('should handle date range filtering', async () => {
			server.use(
				http.get('/api/supabase/invoices', ({ request }) => {
					const url = new URL(request.url);
					const dateFrom = url.searchParams.get('dateFrom');
					const dateTo = url.searchParams.get('dateTo');

					const invoices = [
						{ id: '1', invoiceNumber: 'INV-001', invoiceDate: '2024-01-15' },
						{ id: '2', invoiceNumber: 'INV-002', invoiceDate: '2024-02-15' },
						{ id: '3', invoiceNumber: 'INV-003', invoiceDate: '2024-03-15' },
						{ id: '4', invoiceNumber: 'INV-004', invoiceDate: '2024-04-15' }
					];

					let filtered = invoices;

					if (dateFrom && dateTo) {
						filtered = invoices.filter((inv) => inv.invoiceDate >= dateFrom && inv.invoiceDate <= dateTo);
					}

					return HttpResponse.json({ data: filtered, totalCount: filtered.length });
				})
			);

			const result = await InvoiceApi.endpoints.getInvoices
				.initiate({ dateFrom: '2024-02-01', dateTo: '2024-03-31' })
				.unwrap();

			expect(result.data).toHaveLength(2);
			expect(result.data[0].invoiceNumber).toBe('INV-002');
			expect(result.data[1].invoiceNumber).toBe('INV-003');
		});

		it('should handle departure/return date ranges for groups', async () => {
			server.use(
				http.get('/api/supabase/groups', ({ request }) => {
					const url = new URL(request.url);
					const departureDateFrom = url.searchParams.get('departureDateFrom');
					const departureDateTo = url.searchParams.get('departureDateTo');

					const groups = [
						{ id: '1', groupCode: 'GRP-001', departureDate: '2024-06-01' },
						{ id: '2', groupCode: 'GRP-002', departureDate: '2024-07-15' },
						{ id: '3', groupCode: 'GRP-003', departureDate: '2024-08-01' },
						{ id: '4', groupCode: 'GRP-004', departureDate: '2024-09-15' }
					];

					let filtered = groups;

					if (departureDateFrom && departureDateTo) {
						filtered = groups.filter(
							(g) => g.departureDate >= departureDateFrom && g.departureDate <= departureDateTo
						);
					}

					return HttpResponse.json({ data: filtered, totalCount: filtered.length });
				})
			);

			const result = await GroupApi.endpoints.getGroups
				.initiate({
					departureDateFrom: '2024-07-01',
					departureDateTo: '2024-08-31'
				})
				.unwrap();

			expect(result.data).toHaveLength(2);
			expect(result.data[0].groupCode).toBe('GRP-002');
			expect(result.data[1].groupCode).toBe('GRP-003');
		});
	});

	describe('Search Parameters', () => {
		it('should handle search with special characters', async () => {
			server.use(
				http.get('/api/supabase/customers', ({ request }) => {
					const url = new URL(request.url);
					const search = url.searchParams.get('search');

					const customers = [
						{ id: '1', name: '王小明 & 家人', email: 'wang@example.com' },
						{ id: '2', name: 'John & Jane Doe', email: 'doe@example.com' },
						{ id: '3', name: '測試 / 特殊字元', email: 'test@example.com' },
						{ id: '4', name: '李大華', email: 'lee@example.com' }
					];

					const filtered = search
						? customers.filter(
								(c) =>
									c.name.toLowerCase().includes(search.toLowerCase()) ||
									c.email.toLowerCase().includes(search.toLowerCase())
							)
						: customers;

					return HttpResponse.json({ data: filtered, totalCount: filtered.length });
				})
			);

			// Test with Chinese characters and special symbols
			const result1 = await CustomerApi.endpoints.getCustomers.initiate({ search: '王小明 &' }).unwrap();
			expect(result1.data).toHaveLength(1);
			expect(result1.data[0].name).toContain('王小明');

			// Test with slash
			const result2 = await CustomerApi.endpoints.getCustomers.initiate({ search: '測試 /' }).unwrap();
			expect(result2.data).toHaveLength(1);
			expect(result2.data[0].name).toContain('特殊字元');
		});

		it('should handle multiple search fields', async () => {
			server.use(
				http.get('/api/supabase/esims', ({ request }) => {
					const url = new URL(request.url);
					const search = url.searchParams.get('search');
					const number = url.searchParams.get('number');
					const customerName = url.searchParams.get('customerName');

					const esims = [
						{ id: '1', number: 'ESIM-001', customerName: '王小明', status: 'active' },
						{ id: '2', number: 'ESIM-002', customerName: '李大華', status: 'active' },
						{ id: '3', number: 'ESIM-003', customerName: '王小明', status: 'inactive' },
						{ id: '4', number: 'ESIM-004', customerName: '張三', status: 'active' }
					];

					let filtered = esims;

					if (search) {
						filtered = filtered.filter((e) => e.number.includes(search) || e.customerName.includes(search));
					}

					if (number) {
						filtered = filtered.filter((e) => e.number === number);
					}

					if (customerName) {
						filtered = filtered.filter((e) => e.customerName.includes(customerName));
					}

					return HttpResponse.json({ data: filtered, totalCount: filtered.length });
				})
			);

			// Test combined search
			const result = await EsimApi.endpoints.getEsims
				.initiate({ customerName: '王小明', status: 'active' })
				.unwrap();

			expect(result.data).toHaveLength(1);
			expect(result.data[0].number).toBe('ESIM-001');
		});
	});

	describe('Pagination Parameters', () => {
		it('should handle standard pagination', async () => {
			const totalItems = 100;

			server.use(
				http.get('/api/supabase/orders', ({ request }) => {
					const url = new URL(request.url);
					const page = parseInt(url.searchParams.get('page') || '1');
					const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

					const start = (page - 1) * pageSize;
					const end = start + pageSize;

					const data = Array.from({ length: pageSize }, (_, i) => ({
						id: `${start + i + 1}`,
						orderNumber: `ORD-${String(start + i + 1).padStart(3, '0')}`,
						status: 'confirmed'
					})).slice(0, Math.max(0, totalItems - start));

					return HttpResponse.json({ data, totalCount: totalItems });
				})
			);

			// Test first page
			const page1 = await OrderApi.endpoints.getOrders.initiate({ page: 1, pageSize: 20 }).unwrap();
			expect(page1.data).toHaveLength(20);
			expect(page1.data[0].orderNumber).toBe('ORD-001');
			expect(page1.totalCount).toBe(100);

			// Test middle page
			const page3 = await OrderApi.endpoints.getOrders.initiate({ page: 3, pageSize: 20 }).unwrap();
			expect(page3.data).toHaveLength(20);
			expect(page3.data[0].orderNumber).toBe('ORD-041');

			// Test last page
			const page5 = await OrderApi.endpoints.getOrders.initiate({ page: 5, pageSize: 20 }).unwrap();
			expect(page5.data).toHaveLength(20);
			expect(page5.data[0].orderNumber).toBe('ORD-081');

			// Test partial last page
			const page6 = await OrderApi.endpoints.getOrders.initiate({ page: 6, pageSize: 20 }).unwrap();
			expect(page6.data).toHaveLength(0);
		});

		it('should handle different page sizes', async () => {
			server.use(
				http.get('/api/supabase/orders', ({ request }) => {
					const url = new URL(request.url);
					const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

					const data = Array.from({ length: pageSize }, (_, i) => ({
						id: `${i + 1}`,
						orderNumber: `ORD-${String(i + 1).padStart(3, '0')}`
					}));

					return HttpResponse.json({ data, totalCount: 1000 });
				})
			);

			// Test different page sizes
			const sizes = [10, 20, 50, 100];

			for (const size of sizes) {
				const result = await OrderApi.endpoints.getOrders.initiate({ pageSize: size }).unwrap();
				expect(result.data).toHaveLength(size);
			}
		});
	});

	describe('Special Query Patterns', () => {
		it('should handle query endpoint for groups', async () => {
			server.use(
				http.get('/api/supabase/groups/query', ({ request }) => {
					const url = new URL(request.url);
					const q = url.searchParams.get('q');

					const groups = [
						{ id: '1', groupCode: 'GRP-001', groupName: '日本東京五日遊' },
						{ id: '2', groupCode: 'GRP-002', groupName: '韓國首爾四日遊' },
						{ id: '3', groupCode: 'JPN-001', groupName: '日本大阪自由行' },
						{ id: '4', groupCode: 'KOR-001', groupName: '韓國釜山三日遊' }
					];

					const filtered = q
						? groups.filter(
								(g) =>
									g.groupCode.toLowerCase().includes(q.toLowerCase()) ||
									g.groupName.toLowerCase().includes(q.toLowerCase())
							)
						: groups;

					return HttpResponse.json(filtered);
				})
			);

			// Test query by code
			const result1 = await GroupApi.endpoints.queryGroups.initiate({ q: 'GRP' }).unwrap();
			expect(result1).toHaveLength(2);

			// Test query by name
			const result2 = await GroupApi.endpoints.queryGroups.initiate({ q: '日本' }).unwrap();
			expect(result2).toHaveLength(2);
			expect(result2.every((g) => g.groupName.includes('日本'))).toBe(true);
		});

		it('should handle combined filters with arrays and ranges', async () => {
			server.use(
				http.get('/api/supabase/orders', ({ request }) => {
					const url = new URL(request.url);
					const statuses = url.searchParams.getAll('status');
					const groupCodes = url.searchParams.getAll('groupCodes');
					const dateFrom = url.searchParams.get('dateFrom');
					const dateTo = url.searchParams.get('dateTo');
					const search = url.searchParams.get('search');

					let orders = [
						{
							id: '1',
							orderNumber: 'ORD-001',
							status: 'confirmed',
							groupCode: 'GRP-001',
							orderDate: '2024-01-15',
							customerName: '王小明'
						},
						{
							id: '2',
							orderNumber: 'ORD-002',
							status: 'pending',
							groupCode: 'GRP-002',
							orderDate: '2024-02-15',
							customerName: '李大華'
						},
						{
							id: '3',
							orderNumber: 'ORD-003',
							status: 'confirmed',
							groupCode: 'GRP-001',
							orderDate: '2024-03-15',
							customerName: '張三'
						},
						{
							id: '4',
							orderNumber: 'ORD-004',
							status: 'cancelled',
							groupCode: 'GRP-003',
							orderDate: '2024-04-15',
							customerName: '王小明'
						}
					];

					// Apply all filters
					if (statuses.length > 0) {
						orders = orders.filter((o) => statuses.includes(o.status));
					}

					if (groupCodes.length > 0) {
						orders = orders.filter((o) => groupCodes.includes(o.groupCode));
					}

					if (dateFrom && dateTo) {
						orders = orders.filter((o) => o.orderDate >= dateFrom && o.orderDate <= dateTo);
					}

					if (search) {
						orders = orders.filter(
							(o) => o.orderNumber.includes(search) || o.customerName.includes(search)
						);
					}

					return HttpResponse.json({ data: orders, totalCount: orders.length });
				})
			);

			// Test complex combined query
			const result = await OrderApi.endpoints.getOrders
				.initiate({
					status: ['confirmed', 'pending'],
					groupCodes: ['GRP-001', 'GRP-002'],
					dateFrom: '2024-01-01',
					dateTo: '2024-03-31',
					search: '王'
				})
				.unwrap();

			expect(result.data).toHaveLength(1);
			expect(result.data[0].orderNumber).toBe('ORD-001');
			expect(result.data[0].customerName).toBe('王小明');
		});
	});

	describe('QueryParamsBuilder Advanced Usage', () => {
		it('should build complex query strings correctly', () => {
			const builder = new QueryParamsBuilder();

			// Add various parameter types
			builder.add('search', '測試 & 特殊字元');
			builder.addArray('status', ['pending', 'confirmed']);
			builder.addArray('ids', ['1', '2', '3']);
			builder.addDateRange('2024-01-01', '2024-12-31');
			builder.addPagination(2, 50);
			builder.add('includeDeleted', 'true');

			const queryString = builder.build();

			// Verify all parameters are included
			expect(queryString).toContain('search=' + encodeURIComponent('測試 & 特殊字元'));
			expect(queryString).toContain('status=pending&status=confirmed');
			expect(queryString).toContain('ids=1&ids=2&ids=3');
			expect(queryString).toContain('dateFrom=2024-01-01');
			expect(queryString).toContain('dateTo=2024-12-31');
			expect(queryString).toContain('page=2');
			expect(queryString).toContain('pageSize=50');
			expect(queryString).toContain('includeDeleted=true');
		});

		it('should handle empty arrays gracefully', () => {
			const builder = new QueryParamsBuilder();

			builder.addArray('emptyArray', []);
			builder.addArray('validArray', ['value1', 'value2']);

			const queryString = builder.build();

			expect(queryString).not.toContain('emptyArray');
			expect(queryString).toContain('validArray=value1&validArray=value2');
		});

		it('should handle null and undefined date ranges', () => {
			const builder = new QueryParamsBuilder();

			builder.addDateRange(null, '2024-12-31');
			builder.addDateRange('2024-01-01', undefined);
			builder.addDateRange(undefined, undefined);

			const queryString = builder.build();

			// Should not include any date parameters for invalid ranges
			expect(queryString).toBe('');
		});
	});
});
