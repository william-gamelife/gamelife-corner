'use client';

import { useParams } from 'next/navigation';
import { useGetReceiptsByGroupCodeQuery } from '../../../../receipts/ReceiptApi';
import { useGetInvoicesByGroupCodeQuery } from '../../../../invoices/InvoiceApi';
import ReceiptsTable from './components/ReceiptsTable';
import ProfitTable from './components/ProfitTable';
import InvoicesTable from './components/InvoicesTable';
import { useGetGroupBonusSettingsQuery } from '../../../GroupBonusSettingApi';
import { useProcessInvoices } from '../hooks/useProcessInvoices';

function ProfitTab() {
	const params = useParams();
	const groupCode = params.groupCode as string;
	const { data: bonusSettings, isLoading } = useGetGroupBonusSettingsQuery(groupCode);

	// 使用API查詢獲取該團號的所有收據和發票
	const { data: receipts } = useGetReceiptsByGroupCodeQuery(groupCode);
	const { data: invoices = [], refetch: refetchInvoices } = useGetInvoicesByGroupCodeQuery(groupCode);

	// 使用共用的發票處理邏輯
	const { refundReceipts, bonusInvoices, nonBonusInvoices } = useProcessInvoices(invoices);

	return (
		<div
			className="flex flex-col gap-12"
			id="totalReport"
		>
			{/* 收入表格 - 包含原始收據和從發票提取的退款 */}
			<ReceiptsTable receipts={[...(receipts || []), ...refundReceipts]} />

			{/* 支出表格 - 顯示所有非純獎金發票 */}
			<InvoicesTable
				invoices={nonBonusInvoices}
				title="支出明細"
				allowEdit={false}
				onDataRefresh={refetchInvoices}
			/>

			{/* 利潤表格 */}
			<ProfitTable
				invoices={nonBonusInvoices || []}
				receipts={[...(receipts || []), ...refundReceipts]}
				bonusSettings={bonusSettings || []}
			/>

			{/* 獎金發票表格 */}
			<InvoicesTable
				invoices={bonusInvoices}
				title="獎金明細"
				allowEdit={false}
				onDataRefresh={refetchInvoices}
			/>
		</div>
	);
}

export default ProfitTab;
