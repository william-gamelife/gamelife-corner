import { NextRequest, NextResponse } from 'next/server';
import { toCamelCase, toSnakeCase } from '@/utils/tools';
import { Order } from '@/app/(control-panel)/orders/OrderApi';
import { createClient } from '@/lib/supabase/server';
import OrderModel from '@/app/(control-panel)/orders/models/OrderModel';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest, props: { params: { orderNumber: string } }) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { orderNumber } = await props.params;

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
		.eq('order_number', orderNumber)
		.single();

	if (error) {
		return NextResponse.json({ message: 'Order not found' }, { status: 404 });
	}

	const order = toCamelCase<Order>({ ...data, groupName: data.groups.group_name });
	return NextResponse.json(order, { status: 200 });
}

export async function PUT(req: NextRequest, props: { params: { orderNumber: string } }) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { orderNumber } = await props.params;
	const order = (await req.json()) as Order;
	const snakeCaseOrder = toSnakeCase<Order>(OrderModel(order));

	const { data, error } = await supabase
		.from('orders')
		.update(snakeCaseOrder)
		.eq('order_number', orderNumber)
		.select()
		.single();

	if (error) {
		return NextResponse.json({ message: error.message }, { status: 500 });
	}

	return NextResponse.json(toCamelCase<Order>(data), { status: 200 });
}

export async function DELETE(req: NextRequest, props: { params: { orderNumber: string } }) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { orderNumber } = await props.params;

	const { error } = await supabase.from('orders').delete().eq('order_number', orderNumber);

	if (error) {
		return NextResponse.json({ message: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true }, { status: 200 });
}
