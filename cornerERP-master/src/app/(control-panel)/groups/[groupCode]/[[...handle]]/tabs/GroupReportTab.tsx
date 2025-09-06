'use client';

import { useParams } from 'next/navigation';
import { useGetReceiptsByGroupCodeQuery } from '../../../../receipts/ReceiptApi';
import { useGetInvoicesByGroupCodeQuery } from '../../../../invoices/InvoiceApi';
import ReceiptsTable from './components/ReceiptsTable';
import InvoicesTable from './components/InvoicesTable';
import { useProcessInvoices } from '../hooks/useProcessInvoices'; // 我們會創建這個 hook

function GroupReportTab() {
	const params = useParams();
	const groupCode = params.groupCode as string;

	// 使用API查詢獲取該團號的所有收據和發票
	const { data: receipts } = useGetReceiptsByGroupCodeQuery(groupCode);
	const { data: invoices = [] } = useGetInvoicesByGroupCodeQuery(groupCode);

	// 使用共用的發票處理邏輯
	const { refundReceipts, nonBonusInvoices } = useProcessInvoices(invoices);

	return (
		<div className="w-full space-y-8">
			{/* 收入表格 - 包含原始收據和從發票提取的退款 */}
			<ReceiptsTable receipts={[...(receipts || []), ...refundReceipts]} />

			{/* 支出表格 - 顯示所有非純獎金發票 */}
			<InvoicesTable
				invoices={nonBonusInvoices}
				title="支出明細"
				allowEdit={false}
			/>
		</div>
	);
}

export default GroupReportTab;
