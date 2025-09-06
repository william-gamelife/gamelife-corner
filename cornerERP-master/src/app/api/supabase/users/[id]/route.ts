import { NextRequest, NextResponse } from 'next/server';
import { User } from '@auth/user';
import { toCamelCase, toSnakeCase } from '@/utils/tools';
import { createClient } from '@/lib/supabase/server';
import UserModel from '@/app/(control-panel)/users/models/UserModel';
import { requireAuth, requireAdmin } from '@/lib/auth/middleware';
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	// 檢查認證
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const { id } = await props.params;
	const supabase = await createClient();
	const url = new URL(req.url);
	const withSession = url.searchParams.get('withSession') === 'true';
	const { data, error } = await supabase
		.from(withSession ? 'users' : 'users_limited')
		.select(
			'id, display_name, employee_name, id_number, birthday, title, start_of_duty, end_of_duty,roles,note,photo_url'
		)
		.eq('id', id)
		.single();

	if (error) {
		return NextResponse.json({ message: 'User not found' }, { status: 404 });
	}

	const user = toCamelCase<User>(data);
	return NextResponse.json(user, { status: 200 });
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	// 檢查管理員權限
	const permissionError = await requireAdmin(req);

	if (permissionError) {
		return permissionError;
	}

	const { id } = await props.params;
	const data = (await req.json()) as User;

	const supabase = await createClient();
	const supabaseAdmin = await createClient(true);

	// 如果有密碼，先更新 auth 的密碼
	if (data.password) {
		const { data: user } = await supabase.from('users').select('id, auth_user_id').eq('id', id).single();
		const { error: updatePasswordError } = await supabaseAdmin.auth.admin.updateUserById(user.auth_user_id, {
			password: data.password
		});

		if (updatePasswordError) {
			return NextResponse.json({ message: updatePasswordError.message }, { status: 400 });
		}
	}

	const snakeCaseUser = toSnakeCase<User>(UserModel(data));
	delete snakeCaseUser.password;

	const { data: updatedUser, error } = await supabase.from('users').update(snakeCaseUser).eq('id', id);

	if (error) {
		return NextResponse.json({ message: error.message }, { status: 400 });
	}

	return NextResponse.json(updatedUser, { status: 200 });
}

export async function POST(req: NextRequest) {
	// 檢查管理員權限
	const permissionError = await requireAdmin(req);

	if (permissionError) {
		return permissionError;
	}

	const user = (await req.json()) as User;

	const supabaseAdmin = await createClient(true);
	const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
		email: `${user.id}@cornertravel.com.tw`,
		password: user.password
	});

	if (authError) {
		return NextResponse.json({ message: authError.message }, { status: 400 });
	}

	const snakeCaseUser = toSnakeCase<User>(UserModel(user));

	delete snakeCaseUser.password;

	const supabase = await createClient();
	const { data, error } = await supabase
		.from('users')
		.insert({ ...snakeCaseUser, auth_user_id: authUser.user.id })
		.select()
		.single();

	if (error) {
		return NextResponse.json({ message: error.message }, { status: 400 });
	}

	return NextResponse.json(toCamelCase<User>(data), { status: 200 });
}
