import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient(isAdmin = false) {
	const cookieStore = await cookies();
	const supabaseKey = isAdmin ? process.env.SUPABASE_SERVICE_ROLE : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabaseKey!, {
		cookies: {
			getAll() {
				return cookieStore.getAll();
			},
			setAll(cookiesToSet) {
				try {
					cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
				} catch {
					// The `setAll` method was called from a Server Component.
					// This can be ignored if you have middleware refreshing
					// user sessions.
				}
			}
		}
	});
}
export async function supabaseSignOut() {
	const supabase = await createClient();
	const { error } = await supabase.auth.signOut();

	if (error) {
		console.error('登出時發生錯誤:', error.message);
		throw error;
	}

	return { success: true };
}

/**
 * 刷新用戶的訪問令牌
 * @param currentToken 目前的訪問令牌
 * @returns 成功返回新的會話資訊，失敗返回錯誤
 */
export async function refreshUserToken(refreshToken: string) {
	try {
		// // 驗證當前 token 是否有效
		// const supabaseAdmin = await createClient(true);
		// const { data: tokenData, error: verifyError } = await supabaseAdmin.auth.getUser(currentToken);

		// if (verifyError) {
		// 	console.error('令牌無效或已過期', verifyError);
		// 	return { success: false, error: '令牌無效或已過期', details: verifyError };
		// }

		const supabase = await createClient();

		// 使用當前有效的 token 刷新
		const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
			refresh_token: refreshToken
		});

		if (refreshError) {
			return { success: false, error: '刷新令牌失敗', details: refreshError };
		}

		// 自動設置新的會話，確保持續登入狀態
		if (refreshData.session) {
			// 告訴 supabase 客戶端使用新的會話
			await supabase.auth.setSession({
				access_token: refreshData.session.access_token,
				refresh_token: refreshData.session.refresh_token
			});
		}

		return {
			success: true,
			session: refreshData.session,
			user: refreshData.user
		};
	} catch (_error) {
		return { success: false, error: '刷新過程發生錯誤', details: _error };
	}
}
