import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API 認證中間件
 * 檢查使用者是否已登入並且 session 有效
 * @param request NextRequest 物件
 * @returns 如果認證成功返回 null，否則返回錯誤響應
 */
export async function requireAuth(_request: NextRequest): Promise<NextResponse | null> {
	try {
		const supabase = await createClient();

		// 檢查 session
		const {
			data: { session },
			error: sessionError
		} = await supabase.auth.getSession();

		if (sessionError || !session) {
			return NextResponse.json(
				{
					error: 'UNAUTHORIZED',
					message: '請先登入系統',
					code: 'MISSING_SESSION'
				},
				{ status: 401 }
			);
		}

		// 驗證 session 是否過期
		if (session.expires_at && new Date() > new Date(session.expires_at * 1000)) {
			return NextResponse.json(
				{
					error: 'UNAUTHORIZED',
					message: '登入已過期，請重新登入',
					code: 'SESSION_EXPIRED'
				},
				{ status: 401 }
			);
		}

		// 檢查使用者是否存在
		const {
			data: { user },
			error: userError
		} = await supabase.auth.getUser();

		if (userError || !user) {
			return NextResponse.json(
				{
					error: 'UNAUTHORIZED',
					message: '使用者資料無效',
					code: 'INVALID_USER'
				},
				{ status: 401 }
			);
		}

		// 檢查使用者是否在資料庫中存在且有效
		const { data: userData, error: dbError } = await supabase
			.from('users')
			.select('id, display_name, roles, start_of_duty, end_of_duty')
			.eq('auth_user_id', user.id)
			.single();

		if (dbError || !userData) {
			return NextResponse.json(
				{
					error: 'UNAUTHORIZED',
					message: '找不到使用者資料',
					code: 'USER_NOT_FOUND'
				},
				{ status: 401 }
			);
		}

		// 檢查使用者是否在職
		const currentDate = new Date();
		const startOfDuty = new Date(userData.start_of_duty);

		if (userData.end_of_duty) {
			const endOfDuty = new Date(userData.end_of_duty);

			if (currentDate > endOfDuty) {
				return NextResponse.json(
					{
						error: 'FORBIDDEN',
						message: '您已離職，無法存取系統',
						code: 'USER_INACTIVE'
					},
					{ status: 403 }
				);
			}
		}

		if (currentDate < startOfDuty) {
			return NextResponse.json(
				{
					error: 'FORBIDDEN',
					message: '您尚未到職，無法存取系統',
					code: 'USER_NOT_STARTED'
				},
				{ status: 403 }
			);
		}

		return null; // 認證成功
	} catch (_error) {
		console.error('Auth middleware error:', _error);
		return NextResponse.json(
			{
				error: 'INTERNAL_ERROR',
				message: '認證檢查失敗',
				code: 'AUTH_CHECK_FAILED'
			},
			{ status: 500 }
		);
	}
}

/**
 * 檢查使用者角色權限
 * @param request NextRequest 物件
 * @param requiredRoles 需要的角色陣列
 * @returns 如果有權限返回 null，否則返回錯誤響應
 */
export async function requireRoles(request: NextRequest, requiredRoles: string[]): Promise<NextResponse | null> {
	// 先檢查基本認證
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	try {
		const supabase = await createClient();
		const {
			data: { user }
		} = await supabase.auth.getUser();

		const { data: userData } = await supabase.from('users').select('roles').eq('auth_user_id', user!.id).single();

		const userRoles = userData?.roles || [];
		const hasPermission = requiredRoles.some((role) => userRoles.includes(role));

		if (!hasPermission) {
			return NextResponse.json(
				{
					error: 'INSUFFICIENT_PERMISSIONS',
					message: `此操作需要以下權限之一: ${requiredRoles.join(', ')}`,
					code: 'ROLE_REQUIRED',
					requiredRoles,
					userRoles
				},
				{ status: 403 }
			);
		}

		return null;
	} catch (_error) {
		console.error('Role check error:', _error);
		return NextResponse.json(
			{
				error: 'INTERNAL_ERROR',
				message: '權限檢查失敗',
				code: 'ROLE_CHECK_FAILED'
			},
			{ status: 500 }
		);
	}
}

/**
 * 需要管理員權限的中間件
 * @param request NextRequest 物件
 * @returns 如果是管理員返回 null，否則返回錯誤響應
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
	return requireRoles(request, ['admin']);
}
