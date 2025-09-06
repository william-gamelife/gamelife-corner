import { NextResponse, NextRequest } from 'next/server';
import { toCamelCase, toSnakeCase } from '@/utils/tools';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest, { params }: { params: { billNumber: string } }) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { billNumber } = await params;
	const { data: bill, error } = await supabase.from('bills').select('*').eq('bill_number', billNumber).single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json(toCamelCase(bill));
}

export async function PUT(request: NextRequest, { params }: { params: { billNumber: string } }) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { billNumber } = await params;
	const bill = await request.json();

	// 轉換為 snake_case
	const snakeCaseBill = toSnakeCase(bill);

	const { data, error } = await supabase
		.from('bills')
		.update(snakeCaseBill)
		.eq('bill_number', billNumber)
		.select()
		.single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: { params: { billNumber: string } }) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { billNumber } = await params;
	const { error } = await supabase.from('bills').delete().eq('bill_number', billNumber);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
