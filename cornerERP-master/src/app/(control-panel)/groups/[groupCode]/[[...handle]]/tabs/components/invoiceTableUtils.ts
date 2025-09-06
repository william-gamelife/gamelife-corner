import { Invoice } from '@/app/(control-panel)/invoices/InvoiceApi';

/**
 * 計算發票總金額
 * @param invoices 發票陣列
 * @returns 總金額
 */
export function calculateInvoicesTotal(invoices: Invoice[]): number {
	return invoices.reduce(
		(total, invoice) =>
			total + (invoice.invoiceItems || []).reduce((sum, item) => sum + item.price * item.quantity, 0),
		0
	);
}

/**
 * 按訂單分組並排序發票
 * @param invoices 發票陣列
 * @returns 排序後的發票陣列
 */
export function sortInvoicesByOrder(invoices: Invoice[]): Invoice[] {
	return [...invoices].sort((a, b) => {
		// 先依訂單編號排序
		const orderA = a.orderNumber || '';
		const orderB = b.orderNumber || '';

		if (orderA !== orderB) {
			return orderA.localeCompare(orderB);
		}

		// 再依請款編號排序
		return a.invoiceNumber.localeCompare(b.invoiceNumber);
	});
}

/**
 * 扁平化並排序發票項目
 * @param invoices 發票陣列
 * @returns 排序後的發票項目陣列
 */
export function flattenAndSortInvoiceItems(invoices: Invoice[]) {
	return invoices
		.flatMap((invoice) =>
			(invoice.invoiceItems || []).map((item) => ({
				...item,
				orderNumber: invoice.orderNumber,
				invoiceNumber: invoice.invoiceNumber,
				invoiceDate: invoice.invoiceDate
			}))
		)
		.sort((a, b) => {
			// 1. 先依訂單編號排序
			const orderA = a.orderNumber || '';
			const orderB = b.orderNumber || '';

			if (orderA !== orderB) {
				return orderA.localeCompare(orderB);
			}

			// 2. 再依請款類型排序
			if (a.invoiceType !== b.invoiceType) {
				return a.invoiceType - b.invoiceType;
			}

			// 3. 再依請款編號排序
			if (a.invoiceNumber !== b.invoiceNumber) {
				return a.invoiceNumber.localeCompare(b.invoiceNumber);
			}

			// 4. 最後依請款日期排序
			const dateA = new Date(a.invoiceDate);
			const dateB = new Date(b.invoiceDate);
			return dateA.getTime() - dateB.getTime();
		});
}
