import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/app/(control-panel)/orders/OrderApi';
import { toCamelCase } from '@/utils/tools';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	try {
		// 獲取所有查詢參數
		const url = new URL(req.url);
		const orderNumber = url.searchParams.get('orderNumber');
		const groupCode = url.searchParams.get('groupCode');
		const contactPerson = url.searchParams.get('contactPerson');
		const orderType = url.searchParams.get('orderType');
		const salesPerson = url.searchParams.get('salesPerson');
		const dateFrom = url.searchParams.get('dateFrom');
		const dateTo = url.searchParams.get('dateTo');
		const limit = url.searchParams.get('limit');
		const excludeCompletedGroups = url.searchParams.get('excludeCompletedGroups');

		// 構建基礎查詢
		let query = supabase.from('orders').select(
			`
            *,
            groups:group_code (
                group_name,
                status,
                departure_date
            )
        `
		);

		// 添加排除已結團的過濾條件
		if (excludeCompletedGroups === 'true') {
			query = query.neq('groups.status', 1);
		}

		// 添加所有過濾條件
		if (orderNumber) {
			query = query.ilike('order_number', `%${orderNumber}%`);
		}

		if (groupCode) {
			query = query.ilike('group_code', `%${groupCode}%`);
		}

		if (contactPerson) {
			query = query.ilike('contact_person', `%${contactPerson}%`);
		}

		if (orderType) {
			query = query.ilike('order_type', `%${orderType}%`);
		}

		if (salesPerson) {
			query = query.ilike('sales_person', `%${salesPerson}%`);
		}

		// 修改日期篩選邏輯：只判斷出發日期
		if (dateFrom && dateTo) {
			// 起訖日都有：出發日在此區間內
			query = query.gte('groups.departure_date', dateFrom);
			query = query.lte('groups.departure_date', dateTo);
		} else if (dateFrom) {
			// 只有起日：出發日大於等於此日期
			query = query.gte('groups.departure_date', dateFrom);
		} else if (dateTo) {
			// 只有迄日：出發日小於等於此日期
			query = query.lte('groups.departure_date', dateTo);
		}

		// 添加排序和限制
		query = query.order('order_number', { ascending: false });

		if (limit) {
			query = query.limit(parseInt(limit));
		}

		// 執行查詢
		const { data, error } = await query;

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		const orders = data
			.map((order) => toCamelCase<Order>({ ...order, groupName: order.groups?.group_name }))
			.filter((order) => order.groups !== null);
		return NextResponse.json(orders, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
