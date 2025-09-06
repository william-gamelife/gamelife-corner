import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from 'src/store/store';
import ReceiptApi, {
	useGetReceiptsQuery,
	useCreateReceiptMutation,
	useUpdateReceiptMutation,
	useDeleteReceiptMutation,
	useCreateLinkPayMutation,
	Receipt
} from '@/app/(control-panel)/receipts/ReceiptApi';
import { ReactNode } from 'react';

// 建立測試包裝器
const createWrapper = () => {
	const TestWrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
	TestWrapper.displayName = 'ReceiptTestWrapper';
	return TestWrapper;
};

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('收款流程 API 測試', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// 清除 RTK Query 快取
		store.dispatch(ReceiptApi.util.resetApiState());
	});

	describe('查詢收款單', () => {
		it('應該成功取得收款單列表', async () => {
			const mockReceipts: Receipt[] = [
				{
					receiptNumber: 'R001',
					orderNumber: 'O001',
					receiptDate: new Date('2024-01-15'),
					receiptAmount: 50000,
					actualAmount: 50000,
					receiptType: 1,
					receiptAccount: 'BANK001',
					payDateline: new Date('2024-01-30'),
					email: 'test@example.com',
					note: '首期款',
					status: 1,
					createdAt: new Date(),
					createdBy: 'testuser',
					modifiedAt: new Date(),
					modifiedBy: 'testuser'
				}
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockReceipts
			} as Response);

			const wrapper = createWrapper();
			const { result } = renderHook(() => useGetReceiptsQuery(), { wrapper });

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(mockReceipts);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/supabase/receipts'),
				expect.any(Object)
			);
		});

		it('應該能夠以團號查詢收款單', async () => {
			const mockReceipts: Receipt[] = [
				{
					receiptNumber: 'R001',
					orderNumber: 'O001',
					groupCode: 'G001',
					receiptDate: new Date(),
					receiptAmount: 30000,
					actualAmount: 30000,
					receiptType: 1,
					receiptAccount: 'BANK001',
					payDateline: new Date(),
					email: 'test@example.com',
					note: '',
					status: 1,
					createdAt: new Date(),
					createdBy: 'testuser',
					modifiedAt: new Date(),
					modifiedBy: 'testuser'
				}
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockReceipts
			} as Response);

			const wrapper = createWrapper();
			const { result } = renderHook(() => ReceiptApi.useGetReceiptsByGroupCodeQuery('G001'), { wrapper });

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(mockReceipts);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/supabase/receipts/by-group/G001'),
				expect.any(Object)
			);
		});

		it('應該處理查詢失敗', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Network error'));

			const wrapper = createWrapper();
			const { result } = renderHook(() => useGetReceiptsQuery(), { wrapper });

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});

			expect(result.current.error).toBeDefined();
		});
	});

	describe('建立收款單', () => {
		it('應該成功建立收款單', async () => {
			const newReceipt = {
				receiptNumber: 'R002',
				orderNumber: 'O002',
				receiptDate: new Date('2024-01-20'),
				receiptAmount: 80000,
				actualAmount: 80000,
				receiptType: 1,
				receiptAccount: 'BANK001',
				payDateline: new Date('2024-02-15'),
				email: 'customer@example.com',
				note: '全額付清',
				status: 1
			};

			const mockResponse: Receipt = {
				...newReceipt,
				createdAt: new Date(),
				createdBy: 'testuser',
				modifiedAt: new Date(),
				modifiedBy: 'testuser'
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse
			} as Response);

			const wrapper = createWrapper();
			const { result } = renderHook(() => useCreateReceiptMutation(), { wrapper });

			const [createReceipt] = result.current;
			const response = await createReceipt(newReceipt);

			expect('data' in response && response.data).toEqual(mockResponse);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/supabase/receipts'),
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify(newReceipt)
				})
			);
		});

		it('應該驗證必填欄位', async () => {
			const invalidReceipt = {
				orderNumber: 'O003'
				// 缺少必填欄位
			};

			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 400,
				json: async () => ({ message: '缺少必填欄位' })
			} as Response);

			const wrapper = createWrapper();
			const { result } = renderHook(() => useCreateReceiptMutation(), { wrapper });

			const [createReceipt] = result.current;
			const response = await createReceipt(invalidReceipt as Partial<Receipt>);

			expect('error' in response).toBe(true);
		});

		it('應該驗證金額欄位', async () => {
			const invalidReceipt = {
				receiptNumber: 'R003',
				orderNumber: 'O003',
				receiptDate: new Date(),
				receiptAmount: -1000, // 負數金額
				actualAmount: 0,
				receiptType: 1,
				receiptAccount: 'BANK001',
				payDateline: new Date(),
				email: 'test@example.com',
				note: '',
				status: 1
			};

			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 400,
				json: async () => ({ message: '收款金額不能為負數' })
			} as Response);

			const wrapper = createWrapper();
			const { result } = renderHook(() => useCreateReceiptMutation(), { wrapper });

			const [createReceipt] = result.current;
			const response = await createReceipt(invalidReceipt);

			expect('error' in response).toBe(true);
		});
	});

	describe('更新收款單', () => {
		it('應該成功更新收款單', async () => {
			const updatedReceipt: Receipt = {
				receiptNumber: 'R001',
				orderNumber: 'O001',
				receiptDate: new Date('2024-01-15'),
				receiptAmount: 50000,
				actualAmount: 48000, // 更新實收金額
				receiptType: 1,
				receiptAccount: 'BANK001',
				payDateline: new Date('2024-01-30'),
				email: 'test@example.com',
				note: '銀行手續費扣除',
				status: 1,
				createdAt: new Date(),
				createdBy: 'testuser',
				modifiedAt: new Date(),
				modifiedBy: 'testuser'
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => updatedReceipt
			} as Response);

			const wrapper = createWrapper();
			const { result } = renderHook(() => useUpdateReceiptMutation(), { wrapper });

			const [updateReceipt] = result.current;
			const response = await updateReceipt(updatedReceipt);

			expect('data' in response && response.data).toEqual(updatedReceipt);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/supabase/receipts/R001'),
				expect.objectContaining({
					method: 'PUT',
					body: JSON.stringify(updatedReceipt)
				})
			);
		});

		it('應該處理不存在的收款單', async () => {
			const nonExistentReceipt: Receipt = {
				receiptNumber: 'R999',
				orderNumber: 'O999',
				receiptDate: new Date(),
				receiptAmount: 10000,
				actualAmount: 10000,
				receiptType: 1,
				receiptAccount: 'BANK001',
				payDateline: new Date(),
				email: 'test@example.com',
				note: '',
				status: 1,
				createdAt: new Date(),
				createdBy: 'testuser',
				modifiedAt: new Date(),
				modifiedBy: 'testuser'
			};

			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 404,
				json: async () => ({ message: '收款單不存在' })
			} as Response);

			const wrapper = createWrapper();
			const { result } = renderHook(() => useUpdateReceiptMutation(), { wrapper });

			const [updateReceipt] = result.current;
			const response = await updateReceipt(nonExistentReceipt);

			expect('error' in response).toBe(true);
		});
	});

	describe('刪除收款單', () => {
		it('應該成功刪除單一收款單', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true })
			} as Response);

			const wrapper = createWrapper();
			const { result } = renderHook(() => useDeleteReceiptMutation(), { wrapper });

			const [deleteReceipt] = result.current;
			const response = await deleteReceipt('R001');

			expect('data' in response).toBe(true);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/supabase/receipts/R001'),
				expect.objectContaining({
					method: 'DELETE'
				})
			);
		});

		it('應該成功批量刪除收款單', async () => {
			const receiptNumbers = ['R001', 'R002', 'R003'];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, deletedCount: 3 })
			} as Response);

			const wrapper = createWrapper();
			const { result } = renderHook(() => ReceiptApi.useDeleteReceiptsMutation(), { wrapper });

			const [deleteReceipts] = result.current;
			const response = await deleteReceipts(receiptNumbers);

			expect('data' in response).toBe(true);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/supabase/receipts'),
				expect.objectContaining({
					method: 'DELETE',
					body: JSON.stringify(receiptNumbers)
				})
			);
		});
	});

	describe('LinkPay 整合', () => {
		it('應該成功建立 LinkPay 付款連結', async () => {
			const linkPayData = {
				receiptNumber: 'R001',
				userName: '張三',
				email: 'zhang@example.com',
				createUser: 'testuser',
				paymentName: '團費收款'
			};

			const mockLinkPayResponse = {
				success: true,
				data: {
					receiptNumber: 'R001',
					linkpayOrderNumber: 'LP001',
					price: 50000,
					endDate: new Date('2024-02-15'),
					link: 'https://linkpay.example.com/pay/LP001',
					status: 0,
					paymentName: '團費收款',
					createdAt: new Date(),
					createdBy: 'testuser',
					modifiedAt: new Date(),
					modifiedBy: 'testuser'
				}
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockLinkPayResponse
			} as Response);

			const wrapper = createWrapper();
			const { result } = renderHook(() => useCreateLinkPayMutation(), { wrapper });

			const [createLinkPay] = result.current;
			const response = await createLinkPay(linkPayData);

			expect('data' in response && response.data).toEqual(mockLinkPayResponse);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/supabase/linkpay'),
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify(linkPayData)
				})
			);
		});

		it('應該處理 LinkPay 建立失敗', async () => {
			const linkPayData = {
				receiptNumber: 'R001',
				userName: '張三',
				email: 'invalid-email', // 無效 email
				createUser: 'testuser',
				paymentName: '團費收款'
			};

			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 400,
				json: async () => ({
					success: false,
					message: '無效的 Email 格式'
				})
			} as Response);

			const wrapper = createWrapper();
			const { result } = renderHook(() => useCreateLinkPayMutation(), { wrapper });

			const [createLinkPay] = result.current;
			const response = await createLinkPay(linkPayData);

			expect('error' in response).toBe(true);
		});

		it('應該驗證 LinkPay 付款狀態', async () => {
			const mockReceiptWithLinkPay: Receipt = {
				receiptNumber: 'R001',
				orderNumber: 'O001',
				receiptDate: new Date(),
				receiptAmount: 50000,
				actualAmount: 50000,
				receiptType: 2, // LinkPay
				receiptAccount: 'LINKPAY',
				payDateline: new Date(),
				email: 'test@example.com',
				note: '',
				status: 1,
				createdAt: new Date(),
				createdBy: 'testuser',
				modifiedAt: new Date(),
				modifiedBy: 'testuser',
				linkpay: [
					{
						receiptNumber: 'R001',
						linkpayOrderNumber: 'LP001',
						price: 50000,
						endDate: new Date(),
						link: 'https://linkpay.example.com/pay/LP001',
						status: 1, // 已付款
						paymentName: '團費收款',
						createdAt: new Date(),
						createdBy: 'testuser',
						modifiedAt: new Date(),
						modifiedBy: 'testuser'
					}
				]
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockReceiptWithLinkPay
			} as Response);

			const wrapper = createWrapper();
			const { result } = renderHook(() => ReceiptApi.useGetReceiptQuery('R001'), { wrapper });

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			const receipt = result.current.data;
			expect(receipt?.linkpay).toBeDefined();
			expect(receipt?.linkpay?.[0].status).toBe(1); // 已付款
			expect(receipt?.receiptType).toBe(2); // LinkPay 收款方式
		});
	});

	describe('收款流程業務邏輯', () => {
		it('應該檢查收款金額與實收金額的一致性', () => {
			const receipt: Receipt = {
				receiptNumber: 'R001',
				orderNumber: 'O001',
				receiptDate: new Date(),
				receiptAmount: 50000,
				actualAmount: 48000, // 實收金額少於收款金額
				receiptType: 1,
				receiptAccount: 'BANK001',
				payDateline: new Date(),
				email: 'test@example.com',
				note: '銀行手續費',
				status: 1,
				createdAt: new Date(),
				createdBy: 'testuser',
				modifiedAt: new Date(),
				modifiedBy: 'testuser'
			};

			const difference = receipt.receiptAmount - receipt.actualAmount;
			expect(difference).toBe(2000); // 差額應為 2000
			expect(receipt.note).toContain('手續費'); // 備註應說明差額原因
		});

		it('應該驗證付款截止日期', () => {
			const futureDate = new Date();
			futureDate.setDate(futureDate.getDate() + 30);

			const receipt: Receipt = {
				receiptNumber: 'R001',
				orderNumber: 'O001',
				receiptDate: new Date(),
				receiptAmount: 50000,
				actualAmount: 50000,
				receiptType: 1,
				receiptAccount: 'BANK001',
				payDateline: futureDate,
				email: 'test@example.com',
				note: '',
				status: 0, // 待付款
				createdAt: new Date(),
				createdBy: 'testuser',
				modifiedAt: new Date(),
				modifiedBy: 'testuser'
			};

			const isOverdue = new Date() > receipt.payDateline;
			expect(isOverdue).toBe(false); // 尚未逾期

			// 檢查逾期情況
			const pastDate = new Date();
			pastDate.setDate(pastDate.getDate() - 1);
			receipt.payDateline = pastDate;

			const isNowOverdue = new Date() > receipt.payDateline;
			expect(isNowOverdue).toBe(true); // 已逾期
		});

		it('應該驗證收款狀態轉換', () => {
			// 待付款 -> 已付款
			expect(canTransitionStatus(0, 1)).toBe(true);

			// 已付款 -> 已退款
			expect(canTransitionStatus(1, 2)).toBe(true);

			// 已退款 -> 已付款 (不應該允許)
			expect(canTransitionStatus(2, 1)).toBe(false);
		});
	});
});

// 輔助函數：檢查狀態轉換是否有效
function canTransitionStatus(fromStatus: number, toStatus: number): boolean {
	const validTransitions: Record<number, number[]> = {
		0: [1], // 待付款 -> 已付款
		1: [2], // 已付款 -> 已退款
		2: [] // 已退款 -> 無法轉換
	};

	return validTransitions[fromStatus]?.includes(toStatus) || false;
}
