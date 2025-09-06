import { NextRequest, NextResponse } from 'next/server';
import { toCamelCase } from '@/utils/tools';
import { createClient } from '@/lib/supabase/server';
import { OrderForSelect } from '@/app/(control-panel)/orders/OrderApi';
import { requireAuth } from '@/lib/auth/middleware';
export async function GET(req: NextRequest) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	try {
		// 獲取所有查詢參數

		// 構建基礎查詢
		const { data, error } = await supabase
			.from('orders')
			.select(
				`
            order_number,
            group_code,
            contact_person,
            groups:group_code!inner(
                group_name,
                status
                )
        `
			)
			.not('groups.status', 'eq', 1)
			.order('order_number', { ascending: false });

		// 添加排序和限制

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		const orders = data.map((order) => {
			const orderForSelect = toCamelCase<OrderForSelect>({ ...order, groupName: order.groups?.group_name });
			delete orderForSelect.groups;
			return orderForSelect;
		});

		return NextResponse.json(orders, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
