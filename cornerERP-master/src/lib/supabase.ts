// import { createClient } from '@supabase/supabase-js';
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

// // 基本的 supabase client
// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
// 	auth: {
// 		autoRefreshToken: true,
// 		persistSession: true,
// 		detectSessionInUrl: true
// 	}
// });
// export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

// /**
//  * 刷新用戶的訪問令牌
//  * @param currentToken 目前的訪問令牌
//  * @returns 成功返回新的會話資訊，失敗返回錯誤
//  */
// export async function refreshUserToken(refreshToken: string, currentToken: string) {
// 	try {
// 		// 驗證當前 token 是否有效
// 		const { data: tokenData, error: verifyError } = await supabaseAdmin.auth.getUser(currentToken);

// 		if (verifyError) {
// 			console.error('令牌無效或已過期', verifyError);
// 			return { success: false, error: '令牌無效或已過期', details: verifyError };
// 		}

// 		// 使用當前有效的 token 刷新
// 		const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
// 			refresh_token: refreshToken
// 		});

// 		if (refreshError) {
// 			return { success: false, error: '刷新令牌失敗', details: refreshError };
// 		}

// 		// 自動設置新的會話，確保持續登入狀態
// 		if (refreshData.session) {
// 			// 告訴 supabase 客戶端使用新的會話
// 			await supabase.auth.setSession({
// 				access_token: refreshData.session.access_token,
// 				refresh_token: refreshData.session.refresh_token
// 			});
// 		}

// 		return {
// 			success: true,
// 			session: refreshData.session,
// 			user: refreshData.user
// 		};
// 	} catch (_error) {
// 		return { success: false, error: '刷新過程發生錯誤', details: error };
// 	}
// }
