import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/middleware';
import { toCamelCase } from '@/utils/tools';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		// 驗證認證
		await requireAuth(request);

		const supabase = await createClient();
		const customerId = params.id;

		// 查詢包含該顧客 ID 的所有團
		const { data: groups, error } = await supabase
			.from('groups')
			.select('group_code, group_name, departure_date, return_date, status, created_at')
			.contains('traveller_ids', [customerId])
			.order('departure_date', { ascending: false });

		if (error) {
			console.error('Error fetching customer groups:', error);
			return NextResponse.json({ error: 'Failed to fetch customer groups' }, { status: 500 });
		}

		// 轉換為 camelCase
		const camelCaseGroups = groups?.map((group) => toCamelCase(group)) || [];

		return NextResponse.json({ groups: camelCaseGroups });
	} catch (error) {
		console.error('Error in customer groups API:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
