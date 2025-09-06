import { NextRequest, NextResponse } from 'next/server';
import { toCamelCase } from '@/utils/tools';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest, props: { params: { groupCode: string } }) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { groupCode } = await props.params;

	// 直接根據團號獲取發票
	const { data: invoices, error: invoicesError } = await supabase
		.from('invoices')
		.select('*')
		.eq('group_code', groupCode)
		.order('invoice_number', { ascending: false });

	if (invoicesError) {
		return NextResponse.json({ message: '找不到發票' }, { status: 404 });
	}

	if (!invoices || invoices.length === 0) {
		return NextResponse.json([], { status: 200 });
	}

	const { data, error } = await supabase.rpc('get_invoice_items_with_suppliers_by_array', {
		p_invoice_number: invoices.map((invoice) => invoice.invoice_number)
	});

	if (error) {
		console.error('錯誤:', error);
		return NextResponse.json({ message: '錯誤' }, { status: 500 });
	}

	const invoicesWithItems = invoices.map((invoice) => {
		const items = data.filter((item) => item.invoice_number === invoice.invoice_number);

		// 處理供應商名稱
		const formattedItems = items.map((item) => {
			return {
				...item,
				supplierName: item.suppliers?.supplier_name || ''
			};
		});

		return toCamelCase({
			...invoice,
			invoiceItems: formattedItems.map((item) => toCamelCase(item))
		});
	});

	return NextResponse.json(invoicesWithItems, { status: 200 });
}
