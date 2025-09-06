import '@testing-library/jest-dom';
import { server } from '@/test-utils/msw-server';
import { http, HttpResponse } from 'msw';

// Import all APIs to test backward compatibility
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

describe('Backward Compatibility Tests', () => {
	beforeAll(() => server.listen());
	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	describe('Hook Compatibility', () => {
		it('should export all expected hooks from OrderApi', () => {
			// Verify all hooks are exported
			expect(OrderApi.useGetOrdersQuery).toBeDefined();
			expect(OrderApi.useGetOrderByIdQuery).toBeDefined();
			expect(OrderApi.useCreateOrderMutation).toBeDefined();
			expect(OrderApi.useUpdateOrderMutation).toBeDefined();
			expect(OrderApi.useDeleteOrderMutation).toBeDefined();

			// Verify they are functions
			expect(typeof OrderApi.useGetOrdersQuery).toBe('function');
			expect(typeof OrderApi.useGetOrderByIdQuery).toBe('function');
			expect(typeof OrderApi.useCreateOrderMutation).toBe('function');
			expect(typeof OrderApi.useUpdateOrderMutation).toBe('function');
			expect(typeof OrderApi.useDeleteOrderMutation).toBe('function');
		});

		it('should export all expected hooks from CustomerApi', () => {
			expect(CustomerApi.useGetCustomersQuery).toBeDefined();
			expect(CustomerApi.useGetCustomerByIdQuery).toBeDefined();
			expect(CustomerApi.useCreateCustomerMutation).toBeDefined();
			expect(CustomerApi.useUpdateCustomerMutation).toBeDefined();
			expect(CustomerApi.useDeleteCustomerMutation).toBeDefined();
		});

		it('should export all expected hooks from GroupApi', () => {
			expect(GroupApi.useGetGroupsQuery).toBeDefined();
			expect(GroupApi.useGetGroupByIdQuery).toBeDefined();
			expect(GroupApi.useCreateGroupMutation).toBeDefined();
			expect(GroupApi.useUpdateGroupMutation).toBeDefined();
			expect(GroupApi.useDeleteGroupMutation).toBeDefined();

			// Special query hook
			expect(GroupApi.useQueryGroupsQuery).toBeDefined();
		});

		it('should export all expected hooks from SupplierApi', () => {
			expect(SupplierApi.useGetSuppliersQuery).toBeDefined();
			expect(SupplierApi.useGetSupplierByIdQuery).toBeDefined();
			expect(SupplierApi.useCreateSupplierMutation).toBeDefined();
			expect(SupplierApi.useUpdateSupplierMutation).toBeDefined();
			expect(SupplierApi.useDeleteSupplierMutation).toBeDefined();
		});

		it('should export all expected hooks from InvoiceApi', () => {
			expect(InvoiceApi.useGetInvoicesQuery).toBeDefined();
			expect(InvoiceApi.useGetInvoiceByIdQuery).toBeDefined();
			expect(InvoiceApi.useCreateInvoiceMutation).toBeDefined();
			expect(InvoiceApi.useUpdateInvoiceMutation).toBeDefined();
			expect(InvoiceApi.useDeleteInvoiceMutation).toBeDefined();

			// InvoiceItems hooks
			expect(InvoiceApi.useGetInvoiceItemsQuery).toBeDefined();
			expect(InvoiceApi.useCreateInvoiceItemMutation).toBeDefined();
			expect(InvoiceApi.useUpdateInvoiceItemMutation).toBeDefined();
			expect(InvoiceApi.useDeleteInvoiceItemMutation).toBeDefined();
		});

		it('should export all expected hooks from ReceiptApi', () => {
			expect(ReceiptApi.useGetReceiptsQuery).toBeDefined();
			expect(ReceiptApi.useGetReceiptByIdQuery).toBeDefined();
			expect(ReceiptApi.useCreateReceiptMutation).toBeDefined();
			expect(ReceiptApi.useUpdateReceiptMutation).toBeDefined();
			expect(ReceiptApi.useDeleteReceiptMutation).toBeDefined();

			// LinkPay hooks
			expect(ReceiptApi.useCreateLinkPayMutation).toBeDefined();
			expect(ReceiptApi.useUpdateLinkPayMutation).toBeDefined();
			expect(ReceiptApi.useDeleteLinkPayMutation).toBeDefined();
		});

		it('should export all expected hooks from BillApi', () => {
			expect(BillApi.useGetBillsQuery).toBeDefined();
			expect(BillApi.useGetBillByIdQuery).toBeDefined();
			expect(BillApi.useCreateBillMutation).toBeDefined();
			expect(BillApi.useUpdateBillMutation).toBeDefined();
			expect(BillApi.useDeleteBillMutation).toBeDefined();
		});

		it('should export all expected hooks from EsimApi', () => {
			expect(EsimApi.useGetEsimsQuery).toBeDefined();
			expect(EsimApi.useGetEsimByIdQuery).toBeDefined();
			expect(EsimApi.useCreateEsimMutation).toBeDefined();
			expect(EsimApi.useUpdateEsimMutation).toBeDefined();
			expect(EsimApi.useDeleteEsimMutation).toBeDefined();
		});

		it('should export all expected hooks from UserApi', () => {
			expect(UserApi.useGetUsersQuery).toBeDefined();
			expect(UserApi.useGetUserByIdQuery).toBeDefined();
			expect(UserApi.useCreateUserMutation).toBeDefined();
			expect(UserApi.useUpdateUserMutation).toBeDefined();
			expect(UserApi.useDeleteUserMutation).toBeDefined();
		});

		it('should export all expected hooks from GroupBonusSettingApi', () => {
			expect(GroupBonusSettingApi.useGetGroupBonusSettingsQuery).toBeDefined();
			expect(GroupBonusSettingApi.useGetGroupBonusSettingByIdQuery).toBeDefined();
			expect(GroupBonusSettingApi.useCreateGroupBonusSettingMutation).toBeDefined();
			expect(GroupBonusSettingApi.useUpdateGroupBonusSettingMutation).toBeDefined();
			expect(GroupBonusSettingApi.useDeleteGroupBonusSettingMutation).toBeDefined();
		});

		it('should export all expected hooks from GroupProfitSettingApi', () => {
			expect(GroupProfitSettingApi.useGetGroupProfitSettingsQuery).toBeDefined();
			expect(GroupProfitSettingApi.useGetGroupProfitSettingByIdQuery).toBeDefined();
			expect(GroupProfitSettingApi.useCreateGroupProfitSettingMutation).toBeDefined();
			expect(GroupProfitSettingApi.useUpdateGroupProfitSettingMutation).toBeDefined();
			expect(GroupProfitSettingApi.useDeleteGroupProfitSettingMutation).toBeDefined();
		});
	});

	describe('Endpoint Compatibility', () => {
		it('should maintain all endpoints structure', () => {
			// Check OrderApi endpoints
			expect(OrderApi.endpoints.getOrders).toBeDefined();
			expect(OrderApi.endpoints.getOrderById).toBeDefined();
			expect(OrderApi.endpoints.createOrder).toBeDefined();
			expect(OrderApi.endpoints.updateOrder).toBeDefined();
			expect(OrderApi.endpoints.deleteOrder).toBeDefined();

			// Check special endpoints
			expect(InvoiceApi.endpoints.getInvoiceItems).toBeDefined();
			expect(InvoiceApi.endpoints.createInvoiceItem).toBeDefined();
			expect(ReceiptApi.endpoints.createLinkPay).toBeDefined();
			expect(GroupApi.endpoints.queryGroups).toBeDefined();
		});
	});

	describe('Parameter Compatibility', () => {
		it('should accept all original parameters for getOrders', async () => {
			server.use(
				http.get('/api/supabase/orders', ({ request }) => {
					const url = new URL(request.url);

					// Verify all expected parameters can be received
					const params = {
						search: url.searchParams.get('search'),
						status: url.searchParams.getAll('status'),
						customerIds: url.searchParams.getAll('customerIds'),
						groupCodes: url.searchParams.getAll('groupCodes'),
						dateFrom: url.searchParams.get('dateFrom'),
						dateTo: url.searchParams.get('dateTo'),
						page: url.searchParams.get('page'),
						pageSize: url.searchParams.get('pageSize')
					};

					return HttpResponse.json({
						data: [],
						totalCount: 0,
						receivedParams: params
					});
				})
			);

			const result = await OrderApi.endpoints.getOrders
				.initiate({
					search: 'test',
					status: ['pending', 'confirmed'],
					customerIds: ['1', '2'],
					groupCodes: ['GRP-001'],
					dateFrom: '2024-01-01',
					dateTo: '2024-12-31',
					page: 2,
					pageSize: 50
				})
				.unwrap();

			expect(result.receivedParams.search).toBe('test');
			expect(result.receivedParams.status).toEqual(['pending', 'confirmed']);
			expect(result.receivedParams.customerIds).toEqual(['1', '2']);
			expect(result.receivedParams.groupCodes).toEqual(['GRP-001']);
			expect(result.receivedParams.dateFrom).toBe('2024-01-01');
			expect(result.receivedParams.dateTo).toBe('2024-12-31');
			expect(result.receivedParams.page).toBe('2');
			expect(result.receivedParams.pageSize).toBe('50');
		});

		it('should handle special endpoint parameters', async () => {
			// Test LinkPay parameters
			server.use(
				http.post('/api/supabase/receipts/link-pay', async ({ request }) => {
					const body = await request.json();
					return HttpResponse.json({
						success: true,
						receivedData: body
					});
				})
			);

			const linkPayResult = await ReceiptApi.endpoints.createLinkPay
				.initiate({
					receiptIds: ['1', '2', '3'],
					paymentDate: '2024-01-15',
					note: 'Test payment'
				})
				.unwrap();

			expect(linkPayResult.receivedData.receiptIds).toEqual(['1', '2', '3']);
			expect(linkPayResult.receivedData.paymentDate).toBe('2024-01-15');
			expect(linkPayResult.receivedData.note).toBe('Test payment');

			// Test Group query parameters
			server.use(
				http.get('/api/supabase/groups/query', ({ request }) => {
					const url = new URL(request.url);
					return HttpResponse.json([
						{
							receivedQuery: url.searchParams.get('q')
						}
					]);
				})
			);

			const queryResult = await GroupApi.endpoints.queryGroups
				.initiate({
					q: 'search term'
				})
				.unwrap();

			expect(queryResult[0].receivedQuery).toBe('search term');
		});
	});

	describe('Response Format Compatibility', () => {
		it('should maintain response format for list endpoints', async () => {
			const mockData = {
				data: [
					{ id: '1', orderNumber: 'ORD-001', status: 'confirmed' },
					{ id: '2', orderNumber: 'ORD-002', status: 'pending' }
				],
				totalCount: 2
			};

			server.use(
				http.get('/api/supabase/orders', () => {
					return HttpResponse.json(mockData);
				})
			);

			const result = await OrderApi.endpoints.getOrders.initiate({}).unwrap();

			// Verify response structure
			expect(result).toHaveProperty('data');
			expect(result).toHaveProperty('totalCount');
			expect(Array.isArray(result.data)).toBe(true);
			expect(typeof result.totalCount).toBe('number');
			expect(result.data).toHaveLength(2);
			expect(result.totalCount).toBe(2);
		});

		it('should maintain response format for single item endpoints', async () => {
			const mockOrder = {
				id: '1',
				orderNumber: 'ORD-001',
				customerName: 'Test Customer',
				totalAmount: 10000,
				status: 'confirmed'
			};

			server.use(
				http.get('/api/supabase/orders/1', () => {
					return HttpResponse.json(mockOrder);
				})
			);

			const result = await OrderApi.endpoints.getOrderById.initiate('1').unwrap();

			// Verify single item response
			expect(result).toEqual(mockOrder);
			expect(result.id).toBe('1');
			expect(result.orderNumber).toBe('ORD-001');
		});

		it('should maintain response format for mutation endpoints', async () => {
			const newOrder = {
				orderNumber: 'ORD-003',
				customerName: 'New Customer',
				totalAmount: 15000
			};

			server.use(
				http.post('/api/supabase/orders', async ({ request }) => {
					const body = await request.json();
					return HttpResponse.json({
						id: 'new-id',
						...body,
						createdAt: '2024-01-15T00:00:00Z'
					});
				})
			);

			const result = await OrderApi.endpoints.createOrder.initiate(newOrder).unwrap();

			// Verify mutation response includes ID and timestamps
			expect(result.id).toBe('new-id');
			expect(result.orderNumber).toBe(newOrder.orderNumber);
			expect(result.customerName).toBe(newOrder.customerName);
			expect(result.totalAmount).toBe(newOrder.totalAmount);
			expect(result.createdAt).toBeTruthy();
		});
	});

	describe('Error Handling Compatibility', () => {
		it('should maintain error format', async () => {
			server.use(
				http.get('/api/supabase/orders/non-existent', () => {
					return HttpResponse.json({ message: 'Order not found' }, { status: 404 });
				})
			);

			try {
				await OrderApi.endpoints.getOrderById.initiate('non-existent').unwrap();
				fail('Should have thrown an error');
			} catch (error: unknown) {
				// Verify error structure
				expect(error.status).toBe(404);
				expect(error.data).toHaveProperty('message');
				expect(error.data.message).toBe('Order not found');
			}
		});

		it('should handle validation errors consistently', async () => {
			server.use(
				http.post('/api/supabase/orders', () => {
					return HttpResponse.json(
						{
							message: 'Validation failed',
							errors: {
								orderNumber: 'Order number is required',
								customerName: 'Customer name is required'
							}
						},
						{ status: 400 }
					);
				})
			);

			try {
				await OrderApi.endpoints.createOrder.initiate({}).unwrap();
				fail('Should have thrown an error');
			} catch (error: unknown) {
				expect(error.status).toBe(400);
				expect(error.data.message).toBe('Validation failed');
				expect(error.data.errors).toBeDefined();
				expect(error.data.errors.orderNumber).toBe('Order number is required');
			}
		});
	});

	describe('Tag Invalidation Compatibility', () => {
		it('should maintain tag invalidation behavior', () => {
			// Verify tags are properly defined
			const orderEndpoints = OrderApi.endpoints;

			// Query endpoints should provide tags
			expect(orderEndpoints.getOrders.providesTags).toBeTruthy();
			expect(orderEndpoints.getOrderById.providesTags).toBeTruthy();

			// Mutation endpoints should invalidate tags
			expect(orderEndpoints.createOrder.invalidatesTags).toBeTruthy();
			expect(orderEndpoints.updateOrder.invalidatesTags).toBeTruthy();
			expect(orderEndpoints.deleteOrder.invalidatesTags).toBeTruthy();
		});
	});

	describe('Custom Endpoint Compatibility', () => {
		it('should maintain custom endpoints alongside BaseAPI', async () => {
			// Test InvoiceItems custom endpoints
			server.use(
				http.get('/api/supabase/invoices/123/items', () => {
					return HttpResponse.json([
						{ id: '1', invoiceId: '123', description: 'Item 1', amount: 1000 },
						{ id: '2', invoiceId: '123', description: 'Item 2', amount: 2000 }
					]);
				})
			);

			const items = await InvoiceApi.endpoints.getInvoiceItems.initiate('123').unwrap();
			expect(items).toHaveLength(2);
			expect(items[0].invoiceId).toBe('123');

			// Test LinkPay custom endpoints
			server.use(
				http.post('/api/supabase/receipts/link-pay', async ({ request }) => {
					const body = await request.json();
					return HttpResponse.json({
						success: true,
						processed: body.receiptIds.length,
						linkPayId: 'link-pay-123'
					});
				})
			);

			const linkPayResult = await ReceiptApi.endpoints.createLinkPay
				.initiate({
					receiptIds: ['1', '2'],
					paymentDate: '2024-01-15'
				})
				.unwrap();

			expect(linkPayResult.success).toBe(true);
			expect(linkPayResult.processed).toBe(2);
			expect(linkPayResult.linkPayId).toBe('link-pay-123');
		});
	});

	describe('Migration Path Validation', () => {
		it('should not require any changes to existing component usage', () => {
			// This test validates that the API structure remains the same
			// Components using these APIs should not need any modifications

			const apis = [
				OrderApi,
				CustomerApi,
				GroupApi,
				SupplierApi,
				InvoiceApi,
				ReceiptApi,
				BillApi,
				EsimApi,
				UserApi,
				GroupBonusSettingApi,
				GroupProfitSettingApi
			];

			apis.forEach((api) => {
				// All APIs should have the standard structure
				expect(api).toHaveProperty('endpoints');
				expect(api).toHaveProperty('reducerPath');
				expect(api).toHaveProperty('reducer');
				expect(api).toHaveProperty('middleware');

				// All should export hooks
				const hookNames = Object.keys(api).filter((key) => key.startsWith('use'));
				expect(hookNames.length).toBeGreaterThan(0);
			});
		});
	});
});
