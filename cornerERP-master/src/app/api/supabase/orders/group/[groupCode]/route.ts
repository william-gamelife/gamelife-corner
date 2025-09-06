import { NextRequest, NextResponse } from 'next/server';
import { toCamelCase } from '@/utils/tools';
import { Order } from '@/app/(control-panel)/orders/OrderApi';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest, props: { params: { groupCode: string } }) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { groupCode } = await props.params;

	const { data, error } = await supabase
		.from('orders')
		.select(
			`
            *,
            groups:group_code (
                group_name
            )
        `
		)
		.eq('group_code', groupCode);

	if (error) {
		return NextResponse.json({ message: 'Orders not found' }, { status: 404 });
	}

	const orders = data.map((order) => toCamelCase<Order>({ ...order, groupName: order.groups?.group_name }));
	return NextResponse.json(orders, { status: 200 });
}
