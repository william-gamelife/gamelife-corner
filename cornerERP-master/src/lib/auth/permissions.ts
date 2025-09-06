import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 驗證使用者是否有足夠的權限
 * @param request NextRequest 物件
 * @param requiredRoles 需要的角色陣列
 * @returns 如果有權限返回 null，否則返回錯誤響應
 */
export async function verifyUserPermissions(
	request: NextRequest,
	requiredRoles: string[] = ['admin']
): Promise<NextResponse | null> {
	try {
		const supabase = await createClient();

		// 取得當前使用者
		const {
			data: { user },
			error: authError
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: 'UNAUTHORIZED', message: '請先登入' }, { status: 401 });
		}

		// 從資料庫取得使用者角色
		const { data: userData, error: userError } = await supabase
			.from('users')
			.select('roles')
			.eq('auth_user_id', user.id)
			.single();

		if (userError || !userData) {
			return NextResponse.json({ error: 'USER_NOT_FOUND', message: '找不到使用者資料' }, { status: 404 });
		}

		// 檢查使用者角色
		const userRoles = userData.roles || [];
		const hasPermission = requiredRoles.some((role) => userRoles.includes(role));

		if (!hasPermission) {
			return NextResponse.json(
				{
					error: 'INSUFFICIENT_PERMISSIONS',
					message: `此操作需要以下權限之一: ${requiredRoles.join(', ')}`
				},
				{ status: 403 }
			);
		}

		return null; // 有權限，返回 null
	} catch (_error) {
		console.error('Permission verification error:', _error);
		return NextResponse.json({ error: 'INTERNAL_ERROR', message: '權限驗證失敗' }, { status: 500 });
	}
}

/**
 * 驗證使用者是否為管理員
 * @param request NextRequest 物件
 * @returns 如果是管理員返回 null，否則返回錯誤響應
 */
export async function verifyAdminPermission(request: NextRequest): Promise<NextResponse | null> {
	return verifyUserPermissions(request, ['admin']);
}

/**
 * 取得當前使用者 ID
 * @returns 使用者 ID 或 null
 */
export async function getCurrentUserId(): Promise<string | null> {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error
		} = await supabase.auth.getUser();

		if (error || !user) {
			return null;
		}

		// 從資料庫取得使用者 ID
		const { data: userData, error: userError } = await supabase
			.from('users')
			.select('id')
			.eq('auth_user_id', user.id)
			.single();

		if (userError || !userData) {
			return null;
		}

		return userData.id;
	} catch (_error) {
		console.error('Get current user ID error:', _error);
		return null;
	}
}
