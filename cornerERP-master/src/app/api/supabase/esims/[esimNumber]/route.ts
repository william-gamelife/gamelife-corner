import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getTaipeiTimestamp } from '@/utils/timezone';

export async function GET(request: NextRequest, { params }: { params: Promise<{ esimNumber: string }> }) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { esimNumber } = await params;

	const { data, error } = await supabase.from('esims').select('*').eq('esim_number', esimNumber).single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	if (!data) {
		return NextResponse.json({ error: 'Esim not found' }, { status: 404 });
	}

	// 轉換欄位名稱為駝峰式命名
	const formattedData = {
		esimNumber: data.esim_number,
		groupCode: data.group_code,
		orderNumber: data.order_number,
		supplierOrderNumber: data.supplier_order_number,
		status: data.status,
		productId: data.product_id,
		quantity: data.quantity,
		email: data.email,
		createdAt: data.created_at,
		createdBy: data.created_by,
		modifiedAt: data.modified_at,
		modifiedBy: data.modified_by
	};

	return NextResponse.json(formattedData);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ esimNumber: string }> }) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { esimNumber } = await params;
	const esimData = await request.json();

	// 轉換欄位名稱為蛇形命名
	const formattedEsim = {
		group_code: esimData.groupCode,
		order_number: esimData.orderNumber,
		supplier_order_number: esimData.supplierOrderNumber,
		status: esimData.status,
		product_id: esimData.productId,
		quantity: esimData.quantity,
		email: esimData.email,
		modified_at: getTaipeiTimestamp(),
		modified_by: esimData.modifiedBy
	};

	const { data, error } = await supabase
		.from('esims')
		.update(formattedEsim)
		.eq('esim_number', esimNumber)
		.select()
		.single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	// 轉換回駝峰式命名
	const formattedResponse = {
		esimNumber: data.esim_number,
		groupCode: data.group_code,
		orderNumber: data.order_number,
		supplierOrderNumber: data.supplier_order_number,
		status: data.status,
		productId: data.product_id,
		quantity: data.quantity,
		email: data.email,
		createdAt: data.created_at,
		createdBy: data.created_by,
		modifiedAt: data.modified_at,
		modifiedBy: data.modified_by
	};

	return NextResponse.json(formattedResponse);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ esimNumber: string }> }) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { esimNumber } = await params;

	const { error } = await supabase.from('esims').delete().eq('esim_number', esimNumber);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
