import { NextRequest, NextResponse } from 'next/server';
import { Login, User } from '@auth/user';
import { toCamelCase } from '@/utils/tools';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
	const login = (await req.json()) as Login;

	// 使用正常的 client (不使用 admin 權限)
	const supabase = await createClient();
	const {
		error: authError,
		data: { session }
	} = await supabase.auth.signInWithPassword({
		email: `${login.id}@cornertravel.com.tw`, // 用auth_user_id建立虛擬email
		password: login.password
	});

	if (authError) {
		return NextResponse.json({ message: 'User not found' }, { status: 404 });
	}

	// 登入成功後，使用 session 來取得使用者資料
	const { data, error } = await supabase.rpc('get_user_login_info', { _user_id: login.id }).single();

	if (error) {
		return NextResponse.json({ message: 'User not found' }, { status: 404 });
	}

	const user = toCamelCase<User>(data);
	// 檢查當前日期是否在入職日和離職日之間
	const currentDate = new Date();
	const startOfDuty = new Date(user.startOfDuty);

	// 如果有離職日，則進行檢查
	if (user.endOfDuty) {
		const endOfDuty = new Date(user.endOfDuty);

		if (currentDate > endOfDuty) {
			return NextResponse.json({ message: '您已離職，無法登入系統' }, { status: 403 });
		}
	}

	// 檢查是否已到入職日
	if (!user.startOfDuty || currentDate < startOfDuty) {
		return NextResponse.json({ message: '您尚未到職，無法登入系統' }, { status: 403 });
	}

	return NextResponse.json(
		{
			user,
			session: {
				access_token: session?.access_token,
				refresh_token: session?.refresh_token,
				expires_at: session?.expires_at,
				token_type: session?.token_type,
				user: session?.user
			}
		},
		{ status: 200 }
	);
}

export async function GET(req: NextRequest) {
	// 檢查認證
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const url = new URL(req.url);
	const withSession = url.searchParams.get('withSession') === 'true';
	const { data, error } = await supabase
		.from(withSession ? 'users' : 'users_limited')
		.select('id, display_name, employee_name, id_number, birthday, title, start_of_duty, end_of_duty,roles,note')
		.order('id', { ascending: true });

	if (error) {
		return NextResponse.json({ message: 'User not found' }, { status: 404 });
	}

	const user = data.map((d) => toCamelCase<User>(d)) as User[];

	return NextResponse.json(user, { status: 200 });
}
