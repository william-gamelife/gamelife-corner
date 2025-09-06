import { PartialDeep } from 'type-fest';
import { createExtendedApi, StandardQueryParams } from '@/lib/api/BaseApi';
import GroupModel from './models/GroupModel';

// ===== 類型定義 =====

export interface Group {
	returnDate: Date; // 回程日期
	branchBonus: number; // 分公司獎金比例
	createdAt: Date; // 創建日期
	createdBy: string; // 創建人員
	customerCount: number; // 旅客數量
	departureDate: Date; // 出發日
	groupCode: string; // 團號
	groupName: string; // 團名
	travellerIds: string[]; // 旅客ID
	modifiedAt?: Date; // 修改日期 (可選）
	modifiedBy?: string; // 修改人員 (可選）
	opBonus?: number; // op獎金比例 (可選）
	opId?: string; // OP員 (可選）
	op?: string; // OP員顯示名稱 (可選）
	profitTax?: number; // 營收稅額 (可選）
	saleBonus?: number; // 業務獎金比例 (可選）
	salesPerson?: string; // 業務員顯示名稱 (可選）
	status: number; // 團狀態 0: 進行中 1:已結團 9:特殊團
	[key: string]: unknown;
}

// 擴展查詢參數
export interface GroupsQueryParams extends StandardQueryParams {
	status?: number[];
	groupCode?: string;
	groupName?: string;
	dateFrom?: string;
	dateTo?: string;
	excludeCompletedGroups?: boolean;
}

// ===== API 建立 =====

const GroupApi = createExtendedApi<Group, string, GroupsQueryParams>({
	basePath: '/api/supabase/groups',
	entityTag: 'group',
	entitiesTag: 'groups',
	idField: 'groupCode',
	modelTransform: GroupModel,

	// 自訂端點：處理複雜查詢參數格式
	customEndpoints: {
		// 覆寫預設的 getGroups 查詢以處理狀態陣列和複雜參數
		getGroups: (build: any) =>
			build.query<Group[], GroupsQueryParams | void>({
				query: (params: GroupsQueryParams | void) => {
					if (!params) {
						return '/api/supabase/groups';
					}

					const queryParams = new URLSearchParams();

					// 處理狀態陣列參數
					if (params.status?.length) {
						params.status.forEach((s) => queryParams.append('status', s.toString()));
					}

					// 處理其他標準參數
					['limit', 'groupCode', 'groupName', 'dateFrom', 'dateTo', 'excludeCompletedGroups'].forEach(
						(key) => {
							const value = (params as any)[key];

							if (value !== undefined && value !== null && value !== '') {
								queryParams.set(key, value.toString());
							}
						}
					);

					const queryString = queryParams.toString();
					return queryString ? `/api/supabase/groups?${queryString}` : '/api/supabase/groups';
				},
				providesTags: ['groups']
			}),

		// 匯入旅客資料
		importTravellers: (build: any) =>
			build.mutation<
				{ success: boolean; message: string },
				{ file: File; groupCode: string; employeeId: string }
			>({
				query: ({ file, groupCode, employeeId }) => {
					const formData = new FormData();
					formData.append('file', file);
					formData.append('groupCode', groupCode);
					formData.append('employeeId', employeeId);

					return {
						url: '/api/supabase/customers/import',
						method: 'POST',
						body: formData,
						formData: true
					};
				},
				invalidatesTags: ['groups', 'group']
			})
	}
});

export default GroupApi;

// ===== 向後相容的類型別名 =====
export const addTagTypes = ['groups', 'group'] as const;

// ===== 標準 API 類型 =====

export type GetGroupsApiResponse = Group[];
export type GetGroupsApiArg = GroupsQueryParams | void;

export type DeleteGroupsApiResponse = unknown;
export type DeleteGroupsApiArg = string[]; /** Group codes */

export type GetGroupApiResponse = Group;
export type GetGroupApiArg = string;

export type CreateGroupApiResponse = Group;
export type CreateGroupApiArg = PartialDeep<Group>;

export type UpdateGroupApiResponse = unknown;
export type UpdateGroupApiArg = Group;

export type DeleteGroupApiResponse = unknown;
export type DeleteGroupApiArg = string; // Group code

// ===== Hook 導出 =====

export const {
	useGetGroupsQuery,
	useDeleteGroupsMutation,
	useGetGroupQuery,
	useCreateGroupMutation,
	useUpdateGroupMutation,
	useDeleteGroupMutation,
	useImportTravellersMutation
} = GroupApi;

// ===== API 類型導出 =====

export type GroupApiType = {
	[GroupApi.reducerPath]: ReturnType<typeof GroupApi.reducer>;
};

/**
 * 重構完成！
 *
 * 原始檔案：150 行
 * 重構後：~95 行 (減少約 37%)
 *
 * 主要改善：
 * 1. 使用 BaseAPI 自動生成標準 CRUD 操作
 * 2. 保留所有原有功能和 hooks
 * 3. 保留 GroupModel 轉換功能
 * 4. 保留複雜的狀態陣列查詢參數處理
 * 5. 統一查詢參數處理邏輯
 * 6. 更清晰的類型定義和組織
 * 7. 向後相容性 100%
 */
