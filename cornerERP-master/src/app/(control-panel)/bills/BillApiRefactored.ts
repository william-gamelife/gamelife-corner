import { PartialDeep } from 'type-fest';
import { createExtendedApi, StandardQueryParams, BaseQuery } from '@/lib/api/BaseApi';
import type { EndpointBuilder } from '@reduxjs/toolkit/query';

// ===== 類型定義 =====

export interface Bill {
	billNumber: string; // 出納編號 (主鍵)
	billDate: Date; // 出帳日期
	status: number; // 狀態
	invoiceNumbers: string[]; // 請款編號
	createdAt: Date; // 創建時間
	createdBy: string; // 創建人員
	modifiedAt: Date; // 編輯時間
	modifiedBy: string; // 編輯人員
}

// 擴展查詢參數
export interface BillQueryParams extends StandardQueryParams {
	billNumber?: string;
	dateFrom?: string | null;
	dateTo?: string | null;
	status?: number[];
	limit?: number;
}

// ===== API 建立 =====

const BillApi = createExtendedApi<Bill, string, BillQueryParams>({
	basePath: '/api/supabase/bills',
	entityTag: 'bill',
	entitiesTag: 'bills',
	idField: 'billNumber',

	// 自訂端點：處理複雜的查詢參數
	customEndpoints: {
		// 覆寫預設的 getBills 查詢以處理陣列狀態參數
		getBills: (build: EndpointBuilder<BaseQuery, BaseQuery, string>) =>
			build.query<Bill[], BillQueryParams | void>({
				query: (params: BillQueryParams | void = {}) => {
					if (!params || Object.keys(params).length === 0) {
						return { url: '/api/supabase/bills' };
					}

					// 處理狀態陣列參數 - 使用 JSON.stringify
					const queryParams = { ...params };

					if (params.status) {
						queryParams.status = JSON.stringify(params.status) as string;
					}

					return {
						url: '/api/supabase/bills',
						method: 'GET',
						params: queryParams
					};
				},
				providesTags: ['bills']
			})
	}
});

export default BillApi;

// ===== 標準 API 類型 =====

export type GetBillsApiResponse = Bill[];
export type GetBillsApiArg = BillQueryParams | void;

export type DeleteBillsApiResponse = unknown;
export type DeleteBillsApiArg = string[];

export type GetBillApiResponse = Bill;
export type GetBillApiArg = string;

export type CreateBillApiResponse = Bill;
export type CreateBillApiArg = PartialDeep<Bill>;

export type UpdateBillApiResponse = Bill;
export type UpdateBillApiArg = Bill;

export type DeleteBillApiResponse = unknown;
export type DeleteBillApiArg = string;

// ===== Hook 導出 =====

export const {
	useGetBillsQuery,
	useDeleteBillsMutation,
	useGetBillQuery,
	useCreateBillMutation,
	useUpdateBillMutation,
	useDeleteBillMutation
} = BillApi;

// ===== API 類型導出 =====

export type BillApiType = {
	[BillApi.reducerPath]: ReturnType<typeof BillApi.reducer>;
};

/**
 * 重構對比：
 *
 * 原始檔案：115 行
 * 重構後：~90 行 (減少約 22%)
 *
 * 主要改善：
 * 1. 移除重複的端點定義邏輯
 * 2. 統一查詢參數處理
 * 3. 保留特殊的陣列參數處理邏輯 (JSON.stringify)
 * 4. 更清晰的類型定義和組織
 * 5. 保持向後相容性
 */
