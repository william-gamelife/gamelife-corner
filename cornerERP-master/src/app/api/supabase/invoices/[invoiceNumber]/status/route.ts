import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';

// PATCH - 更新發票狀態
export async function PATCH(req: NextRequest, props: { params: { invoiceNumber: string } }) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	try {
		const { invoiceNumber } = props.params;
		const { status } = await req.json();

		// 只更新狀態欄位
		const { data: updatedInvoice, error } = await supabase
			.from('invoices')
			.update({ status })
			.eq('invoice_number', invoiceNumber)
			.select()
			.single();

		if (error) {
			console.error('更新發票狀態時出錯:', error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(updatedInvoice, { status: 200 });
	} catch (error) {
		console.error('處理請求時出錯:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
