import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getTaipeiTimestamp } from '@/utils/timezone';

export async function GET(request: NextRequest) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();

	// 獲取URL中的查詢參數
	const url = new URL(request.url);
	const searchParams = url.searchParams;

	// 構建查詢
	let query = supabase.from('esims').select('*');

	// 處理篩選條件
	if (searchParams.has('esimNumber') && searchParams.get('esimNumber') !== '') {
		query = query.eq('esim_number', searchParams.get('esimNumber'));
	}

	if (searchParams.has('groupCode') && searchParams.get('groupCode') !== '') {
		query = query.ilike('group_code', `%${searchParams.get('groupCode')}%`);
	}

	if (searchParams.has('orderNumber') && searchParams.get('orderNumber') !== '') {
		query = query.ilike('order_number', `%${searchParams.get('orderNumber')}%`);
	}

	if (searchParams.has('supplierOrderNumber') && searchParams.get('supplierOrderNumber') !== '') {
		query = query.ilike('supplier_order_number', `%${searchParams.get('supplierOrderNumber')}%`);
	}

	if (searchParams.has('status') && searchParams.get('status') !== '') {
		query = query.eq('status', parseInt(searchParams.get('status') || '0'));
	}

	if (searchParams.has('productId') && searchParams.get('productId') !== '') {
		query = query.ilike('product_id', `%${searchParams.get('productId')}%`);
	}

	if (searchParams.has('email') && searchParams.get('email') !== '') {
		query = query.ilike('email', `%${searchParams.get('email')}%`);
	}

	// 執行查詢
	const { data, error } = await query;

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	// 轉換欄位名稱為駝峰式命名
	const formattedData = data.map((esim) => ({
		esimNumber: esim.esim_number,
		groupCode: esim.group_code,
		orderNumber: esim.order_number,
		supplierOrderNumber: esim.supplier_order_number,
		status: esim.status,
		productId: esim.product_id,
		quantity: esim.quantity,
		email: esim.email,
		createdAt: esim.created_at,
		createdBy: esim.created_by,
		modifiedAt: esim.modified_at,
		modifiedBy: esim.modified_by
	}));

	return NextResponse.json(formattedData);
}

export async function POST(request: NextRequest) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const newEsim = await request.json();

	// 轉換欄位名稱為蛇形命名
	const formattedEsim = {
		esim_number: newEsim.esimNumber,
		group_code: newEsim.groupCode,
		order_number: newEsim.orderNumber,
		supplier_order_number: newEsim.supplierOrderNumber,
		status: newEsim.status,
		product_id: newEsim.productId,
		quantity: newEsim.quantity,
		email: newEsim.email,
		created_at: getTaipeiTimestamp(),
		created_by: newEsim.createdBy,
		modified_at: getTaipeiTimestamp(),
		modified_by: newEsim.modifiedBy
	};

	const { data, error } = await supabase.from('esims').insert(formattedEsim).select().single();

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

	// 調用 FastMove POST API
	try {
		const fastMoveParams = new URLSearchParams({
			email: '', // 可根據需要從請求中獲取
			productId: data.product_id || '',
			quantity: data.quantity?.toString() || '1',
			price: '0', // 可根據需要調整
			groupCode: data.group_code || '',
			orderNumber: data.order_number || '',
			createdBy: data.created_by || '',
			invoiceNumber: data.esim_number || ''
		});

		const fastMoveResponse = await fetch(`https://api.cornertravel.com.tw/FastMove?${fastMoveParams.toString()}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!fastMoveResponse.ok) {
			console.error('FastMove API 調用失敗:', fastMoveResponse.status);
		}
	} catch (fastMoveError) {
		console.error('FastMove API 調用錯誤:', fastMoveError);
	}

	return NextResponse.json(formattedResponse);
}

export async function DELETE(request: NextRequest) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const esimNumbers = await request.json();

	const { error } = await supabase.from('esims').delete().in('esim_number', esimNumbers);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
