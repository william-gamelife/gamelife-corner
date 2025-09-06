import { NextRequest, NextResponse } from 'next/server';
import { toCamelCase, toSnakeCase } from '@/utils/tools';
import { Order } from '@/app/(control-panel)/orders/OrderApi';
import { createClient } from '@/lib/supabase/server';
import OrderModel from '@/app/(control-panel)/orders/models/OrderModel';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
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
		.order('group_code', { ascending: false })
		.limit(1000);

	if (error) {
		return NextResponse.json({ message: 'Orders not found' }, { status: 404 });
	}

	const orders = data.map((order) => toCamelCase<Order>({ ...order, groupName: order.groups?.group_name }));
	return NextResponse.json(orders, { status: 200 });
}

export async function POST(req: NextRequest) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const order = await req.json();
	const snakeCaseOrder = toSnakeCase<Order>(OrderModel(order));

	const { data, error } = await supabase.from('orders').insert(snakeCaseOrder).select().single();

	if (error) {
		return NextResponse.json({ message: error.message }, { status: 500 });
	}

	return NextResponse.json(toCamelCase<Order>(data), { status: 200 });
}

export async function DELETE(req: NextRequest) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const orderCodes = await req.json();

	const { error } = await supabase.from('orders').delete().in('order_number', orderCodes);

	if (error) {
		return NextResponse.json({ message: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true }, { status: 200 });
}
