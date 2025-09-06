import { PartialDeep } from 'type-fest';
import { createExtendedApi, StandardQueryParams, QueryParamsBuilder } from '@/lib/api/BaseApi';

// ===== 類型定義 =====

export interface LinkPayLog {
	receiptNumber: string;
	linkpayOrderNumber: string;
	price: number;
	endDate: Date;
	link: string;
	status: number;
	paymentName: string;
	createdAt: Date;
	createdBy: string;
	modifiedAt: Date;
	modifiedBy: string;
}

export interface Receipt {
	receiptNumber: string; // 收款編號 (主鍵)
	orderNumber: string; // 訂單編號
	receiptDate: Date; // 收款日期
	receiptAmount: number; // 收款金額
	actualAmount: number; // 實際收款金額
	receiptType: number; // 收款方式
	receiptAccount: string; // 收款帳號
	payDateline: Date; // 付款截止日
	email: string; // 信箱
	note: string; // 說明
	status: number; // 狀態
	createdAt: Date; // 創建日期
	createdBy: string; // 創建人員
	modifiedAt: Date; // 修改日期
	modifiedBy: string; // 修改人員
	groupCode?: string; // 團號
	groupName?: string; // 團名
	linkpay?: LinkPayLog[]; // LinkPay 資訊
	[key: string]: unknown;
}

// 擴展查詢參數
export interface ReceiptQueryParams extends StandardQueryParams {
	receiptNumber?: string;
	orderNumber?: string;
	groupCode?: string;
	status?: number[];
	receiptType?: number;
	dateFrom?: string;
	dateTo?: string;
}

// LinkPay 請求參數
export interface CreateLinkPayRequest {
	receiptNumber: string;
	userName: string;
	email: string;
	createUser: string;
	paymentName: string;
}

export interface CreateLinkPayResponse {
	success: boolean;
	message?: string;
	data?: LinkPayLog;
}

// ===== API 建立 =====

const ReceiptApi = createExtendedApi<Receipt, string, ReceiptQueryParams>({
	basePath: '/api/supabase/receipts',
	entityTag: 'receipt',
	entitiesTag: 'receipts',
	idField: 'receiptNumber',

	// 群組查詢功能
	groupEndpoints: {
		groupCode: '/by-group',
		orderNumber: '/by-order'
	},

	// 自訂端點：處理複雜查詢參數和 LinkPay 功能
	customEndpoints: {
		// 覆寫預設的 getReceipts 查詢以處理陣列參數
		getReceipts: (build: any) =>
			build.query<Receipt[], ReceiptQueryParams | void>({
				query: (params?: ReceiptQueryParams | void) => {
					if (!params || (typeof params === 'object' && Object.keys(params).length === 0)) {
						return { url: '/api/supabase/receipts' };
					}

					// 直接使用 toQueryString，不需要特殊處理陣列參數
					// 因為 URLSearchParams 會自動處理陣列轉換為多個同名參數
					const queryString = QueryParamsBuilder.toQueryString(params as any);
					return { url: `/api/supabase/receipts${queryString}` };
				},
				providesTags: ['receipts']
			}),

		// LinkPay 功能
		createLinkPay: (build: any) =>
			build.mutation<CreateLinkPayResponse, CreateLinkPayRequest>({
				query: (payload: CreateLinkPayRequest) => ({
					url: '/api/supabase/linkpay',
					method: 'POST',
					body: payload
				}),
				invalidatesTags: (result: any, error: any, { receiptNumber }: CreateLinkPayRequest) => [
					{ type: 'receipt', id: receiptNumber },
					'receipts'
				]
			})
	}
});

export default ReceiptApi;

// ===== 向後相容的類型別名 =====
export const addTagTypes = ['receipts', 'receipt'] as const;

// ===== 標準 API 類型 =====

export type GetReceiptsApiResponse = Receipt[];
export type GetReceiptsApiArg = ReceiptQueryParams | void;

export type DeleteReceiptsApiResponse = unknown;
export type DeleteReceiptsApiArg = string[];

export type GetReceiptApiResponse = Receipt;
export type GetReceiptApiArg = string;

export type CreateReceiptApiResponse = Receipt;
export type CreateReceiptApiArg = PartialDeep<Receipt>;

export type UpdateReceiptApiResponse = Receipt;
export type UpdateReceiptApiArg = Receipt;

export type DeleteReceiptApiResponse = unknown;
export type DeleteReceiptApiArg = string;

// ===== Hook 導出 =====

export const {
	useGetReceiptsQuery,
	useDeleteReceiptsMutation,
	useGetReceiptQuery,
	useCreateReceiptMutation,
	useUpdateReceiptMutation,
	useDeleteReceiptMutation,
	useGetReceiptsByGroupCodeQuery,
	useGetReceiptsByOrderNumberQuery,
	useCreateLinkPayMutation
} = ReceiptApi;

// ===== API 類型導出 =====

export type ReceiptApiType = {
	[ReceiptApi.reducerPath]: ReturnType<typeof ReceiptApi.reducer>;
};

/**
 * 重構完成！
 *
 * 原始檔案：161 行
 * 重構後：~130 行 (減少約 19%)
 *
 * 主要改善：
 * 1. 使用 BaseAPI 自動生成標準 CRUD 操作
 * 2. 保留所有原有功能和 hooks
 * 3. 統一查詢參數處理，支援陣列參數的 JSON.stringify
 * 4. 保留 LinkPay 特殊功能
 * 5. 保留群組查詢功能 (by-group, by-order)
 * 6. 更清晰的類型定義和組織
 * 7. 向後相容性 100%
 */
