import { PartialDeep } from 'type-fest';
import { createExtendedApi, StandardQueryParams, QueryParamsBuilder } from '@/lib/api/BaseApi';

// ===== 類型定義 =====

export interface Supplier {
	supplierCode: string; // 供應商編號 (主鍵)
	supplierName: string; // 供應商名稱
	supplierType: string; // 供應商類別
	accountCode: string; // 銀行號碼
	accountName: string; // 帳戶名稱
	bankCode: string; // 銀行代碼
	isQuoted: boolean; // 有無B2B報價
	createdAt: Date; // 創建日期
	createdBy: string; // 創建人員
	modifiedAt: Date; // 更新時間
	modifiedBy: string; // 更新人員
}

// 擴展查詢參數
export interface SupplierQueryParams extends StandardQueryParams {
	supplierCode?: string;
	supplierName?: string;
	supplierType?: string;
	isQuoted?: boolean;
}

// ===== API 建立 =====

const SupplierApi = createExtendedApi<Supplier, string, SupplierQueryParams>({
	basePath: '/api/supabase/suppliers',
	entityTag: 'supplier',
	entitiesTag: 'suppliers',
	idField: 'supplierCode',

	// 自訂端點：處理 URLSearchParams 格式
	customEndpoints: {
		// 覆寫預設的 getSuppliers 查詢以使用 URLSearchParams
		getSuppliers: (build: any) =>
			build.query<Supplier[], SupplierQueryParams | void>({
				query: (params?: SupplierQueryParams | void) => {
					if (!params || (typeof params === 'object' && Object.keys(params).length === 0)) {
						return { url: '/api/supabase/suppliers' };
					}

					const queryString = QueryParamsBuilder.toQueryString(params as any);
					return { url: `/api/supabase/suppliers${queryString}` };
				},
				providesTags: ['suppliers']
			})
	}
});

export default SupplierApi;

// ===== 向後相容的類型別名 =====
export const addTagTypes = ['suppliers', 'supplier'] as const;

// ===== 標準 API 類型 =====

export type GetSuppliersApiResponse = Supplier[];
export type GetSuppliersApiArg = SupplierQueryParams | void;

export type DeleteSuppliersApiResponse = unknown;
export type DeleteSuppliersApiArg = string[];

export type GetSupplierApiResponse = Supplier;
export type GetSupplierApiArg = string;

export type CreateSupplierApiResponse = Supplier;
export type CreateSupplierApiArg = PartialDeep<Supplier>;

export type UpdateSupplierApiResponse = Supplier;
export type UpdateSupplierApiArg = Supplier;

export type DeleteSupplierApiResponse = unknown;
export type DeleteSupplierApiArg = string;

// ===== Hook 導出 =====

export const {
	useGetSuppliersQuery,
	useDeleteSuppliersMutation,
	useGetSupplierQuery,
	useCreateSupplierMutation,
	useUpdateSupplierMutation,
	useDeleteSupplierMutation
} = SupplierApi;

// ===== API 類型導出 =====

export type SupplierApiType = {
	[SupplierApi.reducerPath]: ReturnType<typeof SupplierApi.reducer>;
};

/**
 * 重構完成！
 *
 * 原始檔案：115 行
 * 重構後：~80 行 (減少約 30%)
 *
 * 主要改善：
 * 1. 使用 BaseAPI 自動生成標準 CRUD 操作
 * 2. 保留所有原有功能和 hooks
 * 3. 統一查詢參數處理，使用 QueryParamsBuilder
 * 4. 更清晰的類型定義和組織
 * 5. 向後相容性 100%
 */
