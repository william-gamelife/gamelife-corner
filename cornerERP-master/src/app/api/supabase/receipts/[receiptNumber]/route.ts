import { NextResponse, NextRequest } from 'next/server';
import { toCamelCase, toSnakeCase } from '@/utils/tools';
import { createClient } from '@/lib/supabase/server';
import { Receipt } from '@/app/(control-panel)/receipts/ReceiptApi';
import ReceiptModel from '@/app/(control-panel)/receipts/models/ReceiptModel';
import { requireAuth } from '@/lib/auth/middleware';
export async function GET(request: NextRequest, { params }: { params: { receiptNumber: string } }) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { receiptNumber } = await params;

	// 獲取收據資訊並同時獲取 LinkPay 資訊
	const { data: receipt, error } = await supabase
		.from('receipts')
		.select(
			`
			*,
			linkpay:receipt_linkpay_log!receipt_number(*)
		`
		)
		.eq('receipt_number', receiptNumber)
		.single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	// 轉換為駝峰命名
	const formattedReceipt = toCamelCase(receipt);

	// 如果有 LinkPay 資訊，也轉換為駝峰命名
	if (receipt.linkpay) {
		formattedReceipt.linkpay = receipt.linkpay.map((linkpay) => toCamelCase(linkpay));
	}

	return NextResponse.json(formattedReceipt);
}

export async function PUT(request: NextRequest, { params }: { params: { receiptNumber: string } }) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { receiptNumber } = await params;
	const receipt = await request.json();
	console.log(receipt);

	const snakeCaseReceipt = toSnakeCase<Receipt>(ReceiptModel(receipt));

	const { data, error } = await supabase
		.from('receipts')
		.update(snakeCaseReceipt)
		.eq('receipt_number', receiptNumber)
		.select()
		.single();

	if (error) {
		console.error(error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: { params: { receiptNumber: string } }) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { receiptNumber } = await params;
	const { error } = await supabase.from('receipts').delete().eq('receipt_number', receiptNumber);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
