import { useState, useEffect } from 'react';
import { Invoice } from '@/app/(control-panel)/invoices/InvoiceApi';
import { Receipt } from '@/app/(control-panel)/receipts/ReceiptApi';
import { INVOICE_ITEM_TYPES } from '@/constants/invoiceItemTypes';

export function useProcessInvoices(invoices: Invoice[]) {
	const [refundReceipts, setRefundReceipts] = useState<Receipt[]>([]);
	const [bonusInvoices, setBonusInvoices] = useState<Invoice[]>([]);
	const [nonBonusInvoices, setNonBonusInvoices] = useState<Invoice[]>([]);

	useEffect(() => {
		if (invoices && invoices.length > 0) {
			const refunds: Receipt[] = [];
			const bonusInvs: Invoice[] = [];
			const regularInvs: Invoice[] = [];

			invoices.forEach((invoice) => {
				// 提取退款項目
				const refundItems =
					invoice.invoiceItems?.filter((item) => item.invoiceType === INVOICE_ITEM_TYPES.REFUND) || [];

				// 提取獎金項目
				const bonusItems =
					invoice.invoiceItems?.filter((item) => item.invoiceType === INVOICE_ITEM_TYPES.BONUS) || [];

				// 提取其他項目
				const regularItems =
					invoice.invoiceItems?.filter(
						(item) =>
							item.invoiceType !== INVOICE_ITEM_TYPES.REFUND &&
							item.invoiceType !== INVOICE_ITEM_TYPES.BONUS
					) || [];

				// 將退款項目轉換為收據
				refundItems.forEach((item) => {
					refunds.push({
						receiptNumber: `${invoice.invoiceNumber}`,
						orderNumber: invoice.orderNumber,
						receiptDate: invoice.invoiceDate,
						receiptAmount: -Math.abs(item.price * item.quantity),
						actualAmount: -Math.abs(item.price * item.quantity),
						receiptType: INVOICE_ITEM_TYPES.REFUND,
						receiptAccount: item.payFor || '',
						status: 1,
						note: `退款: ${item.note || ''}`,
						createdAt: invoice.createdAt,
						createdBy: invoice.createdBy,
						modifiedAt: invoice.modifiedAt,
						modifiedBy: invoice.modifiedBy
					} as Receipt);
				});

				// 如果有獎金項目，創建獎金發票
				if (bonusItems.length > 0) {
					bonusInvs.push({
						...invoice,
						invoiceItems: bonusItems
					});
				}

				// 如果有常規項目，創建常規發票
				if (regularItems.length > 0) {
					regularInvs.push({
						...invoice,
						invoiceItems: regularItems
					});
				}
			});

			setRefundReceipts(refunds);
			setBonusInvoices(bonusInvs);
			setNonBonusInvoices(regularInvs);
		}
	}, [invoices]);

	return {
		refundReceipts,
		bonusInvoices,
		nonBonusInvoices
	};
}
