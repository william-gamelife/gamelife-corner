import { NextRequest, NextResponse } from 'next/server';
import { toCamelCase } from '@/utils/tools';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
	// 檢查認證
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	try {
		const supabase = await createClient();
		const { searchParams } = new URL(request.url);
		const query = searchParams.get('query') || '';

		const { data, error } = await supabase
			.from('customers')
			.select('*')
			.or(`name.ilike.%${query}%, id.ilike.%${query}%, phone.ilike.%${query}%, email.ilike.%${query}%`)
			.order('name');

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		// 將資料從蛇形命名轉換為駝峰式命名
		const camelCasedData = data.map((customer) => toCamelCase(customer));

		return NextResponse.json({ customers: camelCasedData });
	} catch (error) {
		console.error('Error searching customers:', error);
		return NextResponse.json({ error: '搜尋客戶時發生錯誤' }, { status: 500 });
	}
}
