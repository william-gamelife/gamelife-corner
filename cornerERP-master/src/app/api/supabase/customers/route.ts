import { NextRequest, NextResponse } from 'next/server';
import { toCamelCase, toSnakeCase } from '@/utils/tools';
import { Customer } from '@/app/(control-panel)/customers/CustomerApi';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
	// 檢查認證
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	try {
		const supabase = await createClient();
		const { data, error } = await supabase.from('customers').select('*').order('name');

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		// 將資料從蛇形命名轉換為駝峰式命名

		const customers = data.map((customer) => toCamelCase<Customer>(customer));
		return NextResponse.json(customers);
	} catch (error) {
		console.error('Error fetching customers:', error);
		return NextResponse.json({ error: '取得客戶數據時發生錯誤' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	// 檢查認證
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	try {
		const supabase = await createClient();
		const customerData = await request.json();

		// 將資料從駝峰式命名轉換為蛇形命名
		const snakeCasedData = toSnakeCase(customerData);

		const { data, error } = await supabase.from('customers').insert(snakeCasedData).select().single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		// 將資料從蛇形命名轉換為駝峰式命名
		return NextResponse.json(toCamelCase<Customer>(data), { status: 200 });
	} catch (error) {
		console.error('Error creating customer:', error);
		return NextResponse.json({ error: '創建客戶時發生錯誤' }, { status: 500 });
	}
}
