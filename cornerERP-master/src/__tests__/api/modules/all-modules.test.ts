import '@testing-library/jest-dom';
import { server } from '@/test-utils/msw-server';
import { http, HttpResponse } from 'msw';

// Import all API modules
import OrderApi from '@/app/(control-panel)/orders/OrderApi';
import CustomerApi from '@/app/(control-panel)/customers/CustomerApi';
import GroupApi from '@/app/(control-panel)/groups/GroupApi';
import SupplierApi from '@/app/(control-panel)/suppliers/SupplierApi';
import InvoiceApi from '@/app/(control-panel)/invoices/InvoiceApi';
import ReceiptApi from '@/app/(control-panel)/receipts/ReceiptApi';
import BillApi from '@/app/(control-panel)/bills/BillApi';
import EsimApi from '@/app/(control-panel)/esims/EsimApi';
import UserApi from '@/app/(control-panel)/users/UserApi';
import GroupBonusSettingApi from '@/app/(control-panel)/groups/GroupBonusSettingApi';
import GroupProfitSettingApi from '@/app/(control-panel)/groups/GroupProfitSettingApi';

describe('All API Modules Integration Tests', () => {
	beforeAll(() => server.listen());
	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	describe('OrderApi', () => {
		it('should handle order CRUD operations', async () => {
			const mockOrders = [
				{
					id: '1',
					orderNumber: 'ORD-001',
					customerName: 'Test Customer',
					groupCode: 'GRP-001',
					totalAmount: 10000,
					status: 'confirmed'
				}
			];

			server.use(
				http.get('/api/supabase/orders', () => {
					return HttpResponse.json({ data: mockOrders, totalCount: 1 });
				}),
				http.post('/api/supabase/orders', async ({ request }) => {
					const body = await request.json();
					return HttpResponse.json({ id: 'new-order', ...body });
				})
			);

			// Test GET
			const getResult = await OrderApi.endpoints.getOrders.initiate({}).unwrap();
			expect(getResult.data).toHaveLength(1);
			expect(getResult.data[0].orderNumber).toBe('ORD-001');

			// Test CREATE
			const createResult = await OrderApi.endpoints.createOrder
				.initiate({ orderNumber: 'ORD-002', customerName: 'New Customer' })
				.unwrap();
			expect(createResult.orderNumber).toBe('ORD-002');
		});

		it('should handle order search and filters', async () => {
			server.use(
				http.get('/api/supabase/orders', ({ request }) => {
					const url = new URL(request.url);
					const search = url.searchParams.get('search');
					const status = url.searchParams.get('status');

					let data = [
						{ orderNumber: 'ORD-001', status: 'confirmed' },
						{ orderNumber: 'ORD-002', status: 'pending' }
					];

					if (search) {
						data = data.filter((o) => o.orderNumber.includes(search));
					}

					if (status) {
						data = data.filter((o) => o.status === status);
					}

					return HttpResponse.json({ data, totalCount: data.length });
				})
			);

			const result = await OrderApi.endpoints.getOrders
				.initiate({ search: 'ORD-001', status: 'confirmed' })
				.unwrap();

			expect(result.data).toHaveLength(1);
			expect(result.data[0].orderNumber).toBe('ORD-001');
		});
	});

	describe('CustomerApi', () => {
		it('should handle customer operations', async () => {
			const mockCustomers = [{ id: '1', name: 'John Doe', email: 'john@example.com', phone: '0912345678' }];

			server.use(
				http.get('/api/supabase/customers', () => {
					return HttpResponse.json({ data: mockCustomers, totalCount: 1 });
				}),
				http.get('/api/supabase/customers/1', () => {
					return HttpResponse.json(mockCustomers[0]);
				})
			);

			// Test list
			const listResult = await CustomerApi.endpoints.getCustomers.initiate({}).unwrap();
			expect(listResult.data).toHaveLength(1);

			// Test get by ID
			const getResult = await CustomerApi.endpoints.getCustomerById.initiate('1').unwrap();
			expect(getResult.name).toBe('John Doe');
		});
	});

	describe('GroupApi', () => {
		it('should handle group operations and queries', async () => {
			const mockGroups = [
				{
					id: '1',
					groupCode: 'GRP-001',
					groupName: 'Test Tour',
					departureDate: '2024-12-01',
					returnDate: '2024-12-10'
				}
			];

			server.use(
				http.get('/api/supabase/groups', () => {
					return HttpResponse.json({ data: mockGroups, totalCount: 1 });
				}),
				http.get('/api/supabase/groups/query', ({ request }) => {
					const url = new URL(request.url);
					const q = url.searchParams.get('q');

					const filtered = q
						? mockGroups.filter((g) => g.groupCode.includes(q) || g.groupName.includes(q))
						: mockGroups;

					return HttpResponse.json(filtered);
				})
			);

			// Test standard get
			const result = await GroupApi.endpoints.getGroups.initiate({}).unwrap();
			expect(result.data).toHaveLength(1);

			// Test query endpoint
			const queryResult = await GroupApi.endpoints.queryGroups.initiate({ q: 'GRP' }).unwrap();
			expect(queryResult).toHaveLength(1);
		});
	});

	describe('SupplierApi', () => {
		it('should handle supplier operations', async () => {
			const mockSuppliers = [{ id: '1', name: 'Test Supplier', category: 'hotel', contactPerson: 'John' }];

			server.use(
				http.get('/api/supabase/suppliers', () => {
					return HttpResponse.json({ data: mockSuppliers, totalCount: 1 });
				}),
				http.put('/api/supabase/suppliers/1', async ({ request }) => {
					const body = await request.json();
					return HttpResponse.json({ ...mockSuppliers[0], ...body });
				})
			);

			// Test list with filters
			const result = await SupplierApi.endpoints.getSuppliers.initiate({ category: 'hotel' }).unwrap();
			expect(result.data[0].category).toBe('hotel');

			// Test update
			const updateResult = await SupplierApi.endpoints.updateSupplier
				.initiate({ id: '1', name: 'Updated Supplier' })
				.unwrap();
			expect(updateResult.name).toBe('Updated Supplier');
		});
	});

	describe('InvoiceApi', () => {
		it('should handle invoice and invoice items', async () => {
			const mockInvoice = {
				id: '1',
				invoiceNumber: 'INV-001',
				supplierName: 'Test Supplier',
				totalAmount: 50000
			};
			const mockItems = [
				{ id: '1', invoiceId: '1', description: 'Item 1', amount: 30000 },
				{ id: '2', invoiceId: '1', description: 'Item 2', amount: 20000 }
			];

			server.use(
				http.get('/api/supabase/invoices/1', () => {
					return HttpResponse.json(mockInvoice);
				}),
				http.get('/api/supabase/invoices/1/items', () => {
					return HttpResponse.json(mockItems);
				}),
				http.post('/api/supabase/invoices/1/items', async ({ request }) => {
					const body = await request.json();
					return HttpResponse.json({ id: 'new-item', invoiceId: '1', ...body });
				})
			);

			// Test get invoice
			const invoice = await InvoiceApi.endpoints.getInvoiceById.initiate('1').unwrap();
			expect(invoice.invoiceNumber).toBe('INV-001');

			// Test get items
			const items = await InvoiceApi.endpoints.getInvoiceItems.initiate('1').unwrap();
			expect(items).toHaveLength(2);
			expect(items[0].amount + items[1].amount).toBe(50000);

			// Test create item
			const newItem = await InvoiceApi.endpoints.createInvoiceItem
				.initiate({
					invoiceId: '1',
					description: 'New Item',
					amount: 10000
				})
				.unwrap();
			expect(newItem.description).toBe('New Item');
		});
	});

	describe('ReceiptApi', () => {
		it('should handle receipt operations', async () => {
			const mockReceipts = [
				{
					id: '1',
					receiptNumber: 'RCP-001',
					orderNumber: 'ORD-001',
					amount: 5000,
					paymentMethod: 'cash'
				}
			];

			server.use(
				http.get('/api/supabase/receipts', () => {
					return HttpResponse.json({ data: mockReceipts, totalCount: 1 });
				}),
				http.post('/api/supabase/receipts', async ({ request }) => {
					const body = await request.json();
					return HttpResponse.json({ id: 'new-receipt', ...body });
				})
			);

			const result = await ReceiptApi.endpoints.getReceipts.initiate({}).unwrap();
			expect(result.data[0].receiptNumber).toBe('RCP-001');
		});

		it('should handle LinkPay operations', async () => {
			const linkPayData = {
				receiptIds: ['1', '2', '3'],
				paymentDate: '2024-01-15',
				note: 'Batch payment'
			};

			server.use(
				http.post('/api/supabase/receipts/link-pay', async ({ request }) => {
					const body = await request.json();
					return HttpResponse.json({
						success: true,
						processed: body.receiptIds.length
					});
				})
			);

			const result = await ReceiptApi.endpoints.createLinkPay.initiate(linkPayData).unwrap();

			expect(result.success).toBe(true);
			expect(result.processed).toBe(3);
		});
	});

	describe('BillApi', () => {
		it('should handle bill operations', async () => {
			const mockBills = [
				{
					id: '1',
					billNumber: 'BILL-001',
					type: 'payment',
					amount: 10000,
					status: 'paid'
				}
			];

			server.use(
				http.get('/api/supabase/bills', ({ request }) => {
					const url = new URL(request.url);
					const type = url.searchParams.get('type');

					const filtered = type ? mockBills.filter((b) => b.type === type) : mockBills;

					return HttpResponse.json({ data: filtered, totalCount: filtered.length });
				})
			);

			const result = await BillApi.endpoints.getBills.initiate({ type: 'payment' }).unwrap();

			expect(result.data).toHaveLength(1);
			expect(result.data[0].type).toBe('payment');
		});
	});

	describe('EsimApi', () => {
		it('should handle eSIM operations', async () => {
			const mockEsims = [
				{
					id: '1',
					number: 'ESIM-001',
					status: 'active',
					supplier: 'Supplier A',
					customerName: 'John Doe'
				}
			];

			server.use(
				http.get('/api/supabase/esims', () => {
					return HttpResponse.json({ data: mockEsims, totalCount: 1 });
				}),
				http.put('/api/supabase/esims/1', async ({ request }) => {
					const body = await request.json();
					return HttpResponse.json({ ...mockEsims[0], ...body });
				})
			);

			// Test list
			const listResult = await EsimApi.endpoints.getEsims.initiate({}).unwrap();
			expect(listResult.data[0].number).toBe('ESIM-001');

			// Test update
			const updateResult = await EsimApi.endpoints.updateEsim.initiate({ id: '1', status: 'inactive' }).unwrap();
			expect(updateResult.status).toBe('inactive');
		});
	});

	describe('UserApi', () => {
		it('should handle user operations', async () => {
			const mockUsers = [
				{
					id: '1',
					displayName: 'Test User',
					email: 'test@example.com',
					roles: ['admin'],
					startOfDuty: '2024-01-01'
				}
			];

			server.use(
				http.get('/api/supabase/users', () => {
					return HttpResponse.json({ data: mockUsers, totalCount: 1 });
				}),
				http.get('/api/supabase/users/1', () => {
					return HttpResponse.json(mockUsers[0]);
				})
			);

			// Test list
			const users = await UserApi.endpoints.getUsers.initiate({}).unwrap();
			expect(users.data).toHaveLength(1);

			// Test get by ID
			const user = await UserApi.endpoints.getUserById.initiate('1').unwrap();
			expect(user.email).toBe('test@example.com');
		});
	});

	describe('GroupBonusSettingApi', () => {
		it('should handle group bonus settings', async () => {
			const mockSettings = [
				{
					id: '1',
					groupId: 'group-1',
					bonusType: 'percentage',
					bonusValue: 10,
					effectiveDate: '2024-01-01'
				}
			];

			server.use(
				http.get('/api/supabase/group-bonus-settings', () => {
					return HttpResponse.json({ data: mockSettings, totalCount: 1 });
				}),
				http.post('/api/supabase/group-bonus-settings', async ({ request }) => {
					const body = await request.json();
					return HttpResponse.json({ id: 'new-setting', ...body });
				})
			);

			// Test list
			const settings = await GroupBonusSettingApi.endpoints.getGroupBonusSettings.initiate({}).unwrap();
			expect(settings.data[0].bonusType).toBe('percentage');

			// Test create
			const newSetting = await GroupBonusSettingApi.endpoints.createGroupBonusSetting
				.initiate({
					groupId: 'group-2',
					bonusType: 'fixed',
					bonusValue: 5000
				})
				.unwrap();
			expect(newSetting.bonusType).toBe('fixed');
		});
	});

	describe('GroupProfitSettingApi', () => {
		it('should handle group profit settings', async () => {
			const mockSettings = [
				{
					id: '1',
					groupId: 'group-1',
					profitMargin: 15,
					minProfit: 10000,
					effectiveDate: '2024-01-01'
				}
			];

			server.use(
				http.get('/api/supabase/group-profit-settings', () => {
					return HttpResponse.json({ data: mockSettings, totalCount: 1 });
				}),
				http.delete('/api/supabase/group-profit-settings/1', () => {
					return HttpResponse.json({ success: true });
				})
			);

			// Test list
			const settings = await GroupProfitSettingApi.endpoints.getGroupProfitSettings.initiate({}).unwrap();
			expect(settings.data[0].profitMargin).toBe(15);

			// Test delete
			const deleteResult = await GroupProfitSettingApi.endpoints.deleteGroupProfitSetting.initiate('1').unwrap();
			expect(deleteResult.success).toBe(true);
		});
	});

	describe('Cross-Module Integration', () => {
		it('should handle related data across modules', async () => {
			// Mock related data
			server.use(
				http.get('/api/supabase/orders', ({ request }) => {
					const url = new URL(request.url);
					const groupCode = url.searchParams.get('groupCode');

					if (groupCode === 'GRP-001') {
						return HttpResponse.json({
							data: [
								{ orderNumber: 'ORD-001', groupCode: 'GRP-001', totalAmount: 10000 },
								{ orderNumber: 'ORD-002', groupCode: 'GRP-001', totalAmount: 15000 }
							],
							totalCount: 2
						});
					}

					return HttpResponse.json({ data: [], totalCount: 0 });
				}),
				http.get('/api/supabase/receipts', ({ request }) => {
					const url = new URL(request.url);
					const orderNumber = url.searchParams.get('orderNumber');

					if (orderNumber === 'ORD-001') {
						return HttpResponse.json({
							data: [
								{ receiptNumber: 'RCP-001', orderNumber: 'ORD-001', amount: 5000 },
								{ receiptNumber: 'RCP-002', orderNumber: 'ORD-001', amount: 5000 }
							],
							totalCount: 2
						});
					}

					return HttpResponse.json({ data: [], totalCount: 0 });
				})
			);

			// Get orders for a group
			const orders = await OrderApi.endpoints.getOrders.initiate({ groupCode: 'GRP-001' }).unwrap();
			expect(orders.data).toHaveLength(2);

			// Get receipts for an order
			const receipts = await ReceiptApi.endpoints.getReceipts.initiate({ orderNumber: 'ORD-001' }).unwrap();
			expect(receipts.data).toHaveLength(2);

			// Verify total receipts match order amount
			const totalReceipts = receipts.data.reduce((sum, r) => sum + r.amount, 0);
			expect(totalReceipts).toBe(orders.data[0].totalAmount);
		});
	});
});
