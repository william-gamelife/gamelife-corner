import { Invoice } from '@/app/(control-panel)/invoices/InvoiceApi';
import InvoicesTableSimple from './InvoicesTableSimple';
import InvoicesTableEditable from './InvoicesTableEditable';

interface InvoicesTableProps {
	invoices: Invoice[];
	title?: string;
	allowEdit?: boolean;
	onDataRefresh?: () => void;
}

/**
 * InvoicesTable Wrapper 組件
 * 根據 allowEdit prop 決定渲染哪個版本的表格：
 * - allowEdit = false: 使用簡單版本（InvoicesTableSimple），顯示所有發票項目詳細資料
 * - allowEdit = true: 使用可編輯版本（InvoicesTableEditable），支援展開/收合和編輯功能
 */
function InvoicesTable({ invoices, title = '團體支出明細', allowEdit = false, onDataRefresh }: InvoicesTableProps) {
	// 根據 allowEdit 決定使用哪個組件
	if (allowEdit) {
		return (
			<InvoicesTableEditable
				invoices={invoices}
				title={title}
				allowEdit={allowEdit}
				onDataRefresh={onDataRefresh}
			/>
		);
	}

	// 預設使用簡單版本（只讀模式）
	return (
		<InvoicesTableSimple
			invoices={invoices}
			title={title}
		/>
	);
}

export default InvoicesTable;
