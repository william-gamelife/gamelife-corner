import { NextRequest, NextResponse } from 'next/server';
import { toCamelCase } from '@/utils/tools';
import { Customer } from '@/app/(control-panel)/customers/CustomerApi';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
	// 檢查認證
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	try {
		const { ids }: { ids: string[] } = await req.json();

		// 驗證輸入
		if (!Array.isArray(ids)) {
			return NextResponse.json({ error: 'IDs must be an array' }, { status: 400 });
		}

		// 過濾空值和重複值
		const validIds = [...new Set(ids.filter((id) => id && id.trim() !== ''))];

		if (validIds.length === 0) {
			return NextResponse.json({ customers: {} });
		}

		const supabase = await createClient();

		// 使用 in 操作符批量查詢
		const { data, error } = await supabase.from('customers').select('*').in('id', validIds);

		if (error) {
			console.error('Supabase error:', error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		// 將資料轉換為以 ID 為 key 的 Map 結構
		const customersMap: Record<string, Customer> = {};

		data.forEach((customer) => {
			const camelCaseCustomer = toCamelCase<Customer>(customer);
			customersMap[camelCaseCustomer.id] = camelCaseCustomer;
		});

		return NextResponse.json({ customers: customersMap });
	} catch (error) {
		console.error('Error batch fetching customers:', error);
		return NextResponse.json({ error: '批量獲取客戶資料時發生錯誤' }, { status: 500 });
	}
}
