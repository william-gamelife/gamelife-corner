import { NextRequest, NextResponse } from 'next/server';
import { toCamelCase, toSnakeCase } from '@/utils/tools';
import { Customer } from '@/app/(control-panel)/customers/CustomerApi';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/middleware';

// 取得單一客戶
export async function GET(req: NextRequest, props: { params: { id: string } }) {
	// 檢查認證
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	try {
		const supabase = await createClient();
		const params = await props.params;
		const { id } = params;

		const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();

		if (error) {
			if (error.code === 'PGRST116') {
				return NextResponse.json({ error: '客戶不存在' }, { status: 404 });
			}

			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		// 將資料從蛇形命名轉換為駝峰式命名
		return NextResponse.json({ customer: toCamelCase<Customer>(data) }, { status: 200 });
	} catch (error) {
		console.error('Error fetching customer:', error);
		return NextResponse.json({ error: '取得客戶數據時發生錯誤' }, { status: 500 });
	}
}

// 更新客戶
export async function PUT(req: NextRequest, props: { params: { id: string } }) {
	// 檢查認證
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	try {
		const supabase = await createClient();
		const params = await props.params;
		const { id } = params;
		const customerData = await req.json();

		// 將資料從駝峰式命名轉換為蛇形命名
		const snakeCasedData = toSnakeCase(customerData);

		const { data, error } = await supabase.from('customers').update(snakeCasedData).eq('id', id).select().single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		// 將資料從蛇形命名轉換為駝峰式命名
		return NextResponse.json(toCamelCase<Customer>(data), { status: 200 });
	} catch (error) {
		console.error('Error updating customer:', error);
		return NextResponse.json({ error: '更新客戶時發生錯誤' }, { status: 500 });
	}
}

// 刪除客戶
export async function DELETE(req: NextRequest, props: { params: { id: string } }) {
	// 檢查認證
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	try {
		const supabase = await createClient();
		const params = await props.params;
		const { id } = params;

		const { error } = await supabase.from('customers').delete().eq('id', id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting customer:', error);
		return NextResponse.json({ error: '刪除客戶時發生錯誤' }, { status: 500 });
	}
}
