import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getTaipeiTimestamp } from '@/utils/timezone';

export async function GET(request: NextRequest, { params }: { params: { supplierCode: string } }) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { supplierCode } = params;

	const { data, error } = await supabase.from('suppliers').select('*').eq('supplier_code', supplierCode).single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	if (!data) {
		return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
	}

	// 轉換欄位名稱為駝峰式命名
	const formattedData = {
		supplierCode: data.supplier_code,
		supplierName: data.supplier_name,
		supplierType: data.supplier_type,
		accountCode: data.account_code,
		accountName: data.account_name,
		bankCode: data.bank_code,
		isQuoted: data.is_quoted,
		createdAt: data.created_at,
		createdBy: data.created_by,
		modifiedAt: data.modified_at,
		modifiedBy: data.modified_by
	};

	return NextResponse.json(formattedData);
}

export async function PUT(request: NextRequest, { params }: { params: { supplierCode: string } }) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { supplierCode } = params;
	const supplierData = await request.json();

	// 轉換欄位名稱為蛇形命名
	const formattedSupplier = {
		supplier_name: supplierData.supplierName,
		supplier_type: supplierData.supplierType,
		account_code: supplierData.accountCode,
		account_name: supplierData.accountName,
		bank_code: supplierData.bankCode,
		is_quoted: supplierData.isQuoted,
		modified_at: getTaipeiTimestamp(),
		modified_by: supplierData.modifiedBy
	};

	const { data, error } = await supabase
		.from('suppliers')
		.update(formattedSupplier)
		.eq('supplier_code', supplierCode)
		.select()
		.single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	// 轉換回駝峰式命名
	const formattedResponse = {
		supplierCode: data.supplier_code,
		supplierName: data.supplier_name,
		supplierType: data.supplier_type,
		accountCode: data.account_code,
		accountName: data.account_name,
		bankCode: data.bank_code,
		isQuoted: data.is_quoted,
		createdAt: data.created_at,
		createdBy: data.created_by,
		modifiedAt: data.modified_at,
		modifiedBy: data.modified_by
	};

	return NextResponse.json(formattedResponse);
}

export async function DELETE(request: NextRequest, { params }: { params: { supplierCode: string } }) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { supplierCode } = params;

	const { error } = await supabase.from('suppliers').delete().eq('supplier_code', supplierCode);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
