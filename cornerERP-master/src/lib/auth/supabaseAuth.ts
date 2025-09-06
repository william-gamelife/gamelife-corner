import { createClient } from '@/lib/supabase/client';
import { User } from '@auth/user';
import type { Session } from '@supabase/supabase-js';

/**
 * Supabase 認證管理
 */
export class SupabaseAuth {
	private supabase = createClient();

	/**
	 * 登入
	 */
	async signIn(id: string, password: string) {
		try {
			// 直接呼叫我們的登入 API
			const response = await fetch('/api/supabase/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id, password })
			});

			const data = await response.json();

			if (!response.ok) {
				return { success: false, error: data.message || '登入失敗' };
			}

			// 設置 Supabase session 到客戶端
			if (data.session) {
				await this.supabase.auth.setSession({
					access_token: data.session.access_token,
					refresh_token: data.session.refresh_token
				});
			}

			return {
				success: true,
				session: data.session,
				user: data.user
			};
		} catch (_error) {
			return { success: false, error: '登入失敗' };
		}
	}

	/**
	 * 登出
	 */
	async signOut() {
		try {
			const { error } = await this.supabase.auth.signOut();

			if (error) {
				return { success: false, error: error.message };
			}

			return { success: true };
		} catch (_error) {
			return { success: false, error: '登出失敗' };
		}
	}

	/**
	 * 取得目前使用者
	 */
	async getCurrentUser() {
		try {
			const {
				data: { session },
				error: sessionError
			} = await this.supabase.auth.getSession();

			if (sessionError || !session) {
				return { success: false, error: '未登入' };
			}

			const {
				data: { user },
				error: userError
			} = await this.supabase.auth.getUser();

			if (userError || !user) {
				return { success: false, error: '找不到使用者' };
			}

			// 從 email 中取得 user ID
			const userId = user.email?.split('@')[0];

			if (!userId) {
				return { success: false, error: '無效的使用者' };
			}

			const userInfo = await this.getUserInfo(userId);

			if (!userInfo.success) {
				return userInfo;
			}

			return {
				success: true,
				session,
				user: userInfo.user
			};
		} catch (_error) {
			return { success: false, error: '取得使用者失敗' };
		}
	}

	/**
	 * 從資料庫取得使用者資訊
	 */
	private async getUserInfo(userId: string) {
		try {
			const response = await fetch(`/api/supabase/users/${userId}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				throw new Error('Failed to fetch user info');
			}

			const userData = await response.json();

			// 檢查在職狀態
			const currentDate = new Date();
			const startOfDuty = new Date(userData.startOfDuty);

			if (userData.endOfDuty) {
				const endOfDuty = new Date(userData.endOfDuty);

				if (currentDate > endOfDuty) {
					return { success: false, error: '您已離職，無法登入系統' };
				}
			}

			if (currentDate < startOfDuty) {
				return { success: false, error: '您尚未到職，無法登入系統' };
			}

			return {
				success: true,
				user: userData as User
			};
		} catch (_error) {
			return { success: false, error: '取得使用者資料失敗' };
		}
	}

	/**
	 * 監聽認證狀態變化
	 */
	onAuthStateChange(callback: (session: Session | null, user?: User) => void) {
		return this.supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === 'SIGNED_IN' && session) {
				const userId = session.user.email?.split('@')[0];

				if (userId) {
					const userInfo = await this.getUserInfo(userId);
					callback(session, userInfo.success ? userInfo.user : undefined);
				} else {
					callback(session, undefined);
				}
			} else if (event === 'SIGNED_OUT') {
				callback(null, undefined);
			} else {
				callback(session, undefined);
			}
		});
	}

	/**
	 * 刷新 Token
	 */
	async refreshSession() {
		try {
			const { data, error } = await this.supabase.auth.refreshSession();

			if (error) {
				return { success: false, error: error.message };
			}

			return { success: true, session: data.session };
		} catch (_error) {
			return { success: false, error: '刷新失敗' };
		}
	}
}

// 匯出單例
export const supabaseAuth = new SupabaseAuth();
