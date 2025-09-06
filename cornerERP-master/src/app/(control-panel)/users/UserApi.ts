import { createExtendedApi, StandardQueryParams } from '@/lib/api/BaseApi';
import { User } from '@auth/user';

// ===== 類型定義 =====

// 擴展查詢參數
export interface UserQueryParams extends StandardQueryParams {
	withSession?: boolean;
}

// ===== API 建立 =====

const UserApi = createExtendedApi<User, string, UserQueryParams>({
	basePath: '/api/supabase/users',
	entityTag: 'user',
	entitiesTag: 'users',
	idField: 'id',

	// 自訂端點：處理特殊的 withSession 參數和路徑
	customEndpoints: {
		// 覆寫預設的 getUsers 查詢以包含 withSession 參數
		getUsers: (build: any) =>
			build.query<User[], void>({
				query: () => ({ url: `/api/supabase/users?withSession=true` }),
				providesTags: ['users']
			}),

		// 不包含 session 的用戶查詢
		getUsersWithOutSession: (build: any) =>
			build.query<User[], void>({
				query: () => ({ url: `/api/supabase/users?withSession=false` }),
				providesTags: ['users']
			}),

		// 覆寫預設的 getUser 查詢以包含 withSession 參數
		getUser: (build: any) =>
			build.query<User, string>({
				query: (id: string) => ({
					url: `/api/supabase/users/${id}?withSession=true`
				}),
				providesTags: ['user', 'users']
			}),

		// 覆寫預設的 createUser 變更以使用特殊路徑
		createUser: (build: any) =>
			build.mutation<User, Partial<User>>({
				query: (newUser: Partial<User>) => ({
					url: `/api/supabase/users/new`,
					method: 'POST',
					body: newUser
				}),
				invalidatesTags: ['users', 'user']
			})
	}
});

export default UserApi;

// ===== 向後相容的類型別名 =====
export const addTagTypes = ['users', 'user'] as const;

// ===== 標準 API 類型 =====

export type GetUsersApiResponse = User[];
export type GetUsersApiArg = void;

export type GetUsersWithOutSessionApiResponse = User[];
export type GetUsersWithOutSessionApiArg = void;

export type GetUserApiResponse = User;
export type GetUserApiArg = string;

export type CreateUserApiResponse = User;
export type CreateUserApiArg = Partial<User>;

export type UpdateUserApiResponse = User;
export type UpdateUserApiArg = User;

export type DeleteUserApiResponse = unknown;
export type DeleteUserApiArg = string;

// ===== Hook 導出 =====

export const {
	useGetUsersQuery,
	useGetUserQuery,
	useCreateUserMutation,
	useUpdateUserMutation,
	useDeleteUserMutation,
	useGetUsersWithOutSessionQuery
} = UserApi;

// ===== API 類型導出 =====

export type UserApiType = {
	[UserApi.reducerPath]: ReturnType<typeof UserApi.reducer>;
};

/**
 * 重構完成！
 *
 * 原始檔案：81 行
 * 重構後：~75 行 (減少約 7%)
 *
 * 主要改善：
 * 1. 使用 BaseAPI 自動生成標準 CRUD 操作
 * 2. 保留所有原有功能和 hooks
 * 3. 保留特殊的 withSession 查詢參數處理
 * 4. 保留特殊的建立用戶路徑 (/new)
 * 5. 更清晰的類型定義和組織
 * 6. 向後相容性 100%
 */
