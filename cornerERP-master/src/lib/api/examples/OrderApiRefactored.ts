/**
 * 使用 BaseAPI 重構後的 OrderApi 示範
 * 這個檔案展示如何將現有的 OrderApi 重構為使用 BaseAPI 抽象層
 */

import { PartialDeep } from 'type-fest';
import { createExtendedApi, StandardQueryParams } from '../BaseApi';
import OrderModel from '@/app/(control-panel)/orders/models/OrderModel';

// ===== 類型定義 =====

export interface Order {
	orderNumber: string; // 訂單編號
	groupCode: string; // 團號
	contactPerson: string; // 聯絡人
	contactPhone: string; // 聯絡電話
	orderType: string; // 訂單類型
	salesPerson: string; // 業務員
	opId?: string; // OP員
	createdAt: Date; // 創建日期
	createdBy: string; // 創建人員
	modifiedAt?: Date; // 修改日期
	modifiedBy?: string; // 修改人員
	groupName?: string; // 團名
}

export interface OrderForSelect {
	orderNumber: string; // 訂單編號
	groupCode: string; // 團號
	groupName: string; // 團名
}

// 擴展查詢參數
export interface OrderQueryParams extends StandardQueryParams {
	orderType?: string;
	salesPerson?: string;
	groupCode?: string;
}

// ===== API 建立 =====

const OrderApi = createExtendedApi<Order, string, OrderQueryParams>({
	basePath: '/api/supabase/orders',
	entityTag: 'order',
	entitiesTag: 'orders',
	idField: 'orderNumber',
	modelTransform: OrderModel,

	// 搜尋功能
	searchEndpoint: {
		path: '/by-search'
	},

	// 群組查詢功能
	groupEndpoints: {
		groupCode: '/group'
	},

	// 選擇列表功能
	selectEndpoint: {
		path: '/for-select'
	}
});

export default OrderApi;

// ===== 標準 API 類型 =====

export type GetOrdersApiResponse = Order[];
export type GetOrdersApiArg = OrderQueryParams | void;

export type DeleteOrdersApiResponse = unknown;
export type DeleteOrdersApiArg = string[];

export type GetOrderApiResponse = Order;
export type GetOrderApiArg = string;

export type CreateOrderApiResponse = Order;
export type CreateOrderApiArg = PartialDeep<Order>;

export type UpdateOrderApiResponse = unknown;
export type UpdateOrderApiArg = Order;

export type DeleteOrderApiResponse = unknown;
export type DeleteOrderApiArg = string;

export type GetOrdersForSelectApiResponse = OrderForSelect[];
export type GetOrdersForSelectApiArg = void;

// ===== Hook 導出 =====

export const {
	useGetOrdersQuery,
	useDeleteOrdersMutation,
	useGetOrderQuery,
	useCreateOrderMutation,
	useUpdateOrderMutation,
	useDeleteOrderMutation,
	useGetOrdersByGroupCodeQuery,
	useGetOrdersForSelectQuery
} = OrderApi;

// ===== API 類型導出 =====

export type OrderApiType = {
	[OrderApi.reducerPath]: ReturnType<typeof OrderApi.reducer>;
};

/**
 * 重構對比：
 *
 * 原始檔案：131 行
 * 重構後：~90 行 (減少約 30%)
 *
 * 主要改善：
 * 1. 移除重複的端點定義邏輯
 * 2. 統一查詢參數處理
 * 3. 自動生成標準 CRUD 操作
 * 4. 提供擴展點用於自訂功能
 * 5. 型別安全且一致的 API 結構
 */
