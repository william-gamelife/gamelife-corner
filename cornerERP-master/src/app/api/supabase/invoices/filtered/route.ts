import { NextRequest, NextResponse } from 'next/server';
import { Invoice } from '@/app/(control-panel)/invoices/InvoiceApi';
import { toCamelCase } from '@/utils/tools';
import { createClient } from '@/lib/supabase/server';
import _ from 'lodash';
import { requireAuth } from '@/lib/auth/middleware';

// POST - 獲取過濾後的發票
export async function POST(req: NextRequest) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { status, invoiceNumbers } = await req.json();

	let allResults = [];

	// 如果有狀態篩選條件
	if (status?.length > 0) {
		const { data: statusResults } = await supabase
			.from('invoices')
			.select(`*, group:groups(group_name)`)
			.in('status', status)
			.order('invoice_date', { ascending: true });

		if (statusResults) {
			allResults = [...statusResults];
		}
	}

	// 如果有發票編號篩選條件
	if (invoiceNumbers?.length > 0) {
		const { data: invoiceResults } = await supabase
			.from('invoices')
			.select(`*, group:groups(group_name)`)
			.in('invoice_number', invoiceNumbers)
			.order('invoice_date', { ascending: true });

		if (invoiceResults) {
			// 合併結果並去重
			invoiceResults.forEach((invoice) => {
				if (!allResults.some((item) => item.invoice_number === invoice.invoice_number)) {
					allResults.push(invoice);
				}
			});
		}
	}

	// 如果沒有篩選條件，獲取所有發票
	if ((!status || status.length === 0) && (!invoiceNumbers || invoiceNumbers.length === 0)) {
		const { data } = await supabase
			.from('invoices')
			.select(`*, group:groups(group_name)`)
			.order('invoice_date', { ascending: true });

		if (data) {
			allResults = data;
		}
	}

	// 轉換發票數據
	const invoices = _.sortBy(allResults, 'invoice_date').map((d) =>
		toCamelCase<Invoice>({ ...d, groupName: d.group.group_name })
	);

	const { data: invoiceItems, error: itemsError } = await supabase.rpc('get_invoice_items_with_suppliers_by_array', {
		p_invoice_number: invoices.map((invoice) => invoice.invoiceNumber)
	});

	if (itemsError) {
		console.error('錯誤:', itemsError);
		return NextResponse.json({ message: '錯誤' }, { status: 500 });
	}

	const invoicesWithItems = invoices.map((invoice) => {
		const items = invoiceItems.filter((item) => item.invoice_number === invoice.invoiceNumber);

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
