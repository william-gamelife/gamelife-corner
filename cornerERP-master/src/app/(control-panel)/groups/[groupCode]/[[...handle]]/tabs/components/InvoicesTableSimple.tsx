import { Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Typography } from '@mui/material';
import { Invoice } from '@/app/(control-panel)/invoices/InvoiceApi';
import { format } from 'date-fns';
import { INVOICE_ITEM_TYPE_NAMES } from '@/constants/invoiceItemTypes';
import { useSupplierDictionary } from '@/app/(control-panel)/suppliers/hooks/useSupplierDictionary';
import { calculateInvoicesTotal, flattenAndSortInvoiceItems } from './invoiceTableUtils';

interface InvoicesTableSimpleProps {
	invoices: Invoice[];
	title?: string;
}

/**
 * 簡單版本的發票表格組件（用於只讀模式）
 * 顯示所有發票項目的詳細資料，無展開功能
 */
function InvoicesTableSimple({ invoices, title = '團體支出明細' }: InvoicesTableSimpleProps) {
	const { getSupplierName } = useSupplierDictionary();

	// 計算總金額
	const totalAmount = calculateInvoicesTotal(invoices);

	// 處理排序的資料
	const sortedInvoiceItems = flattenAndSortInvoiceItems(invoices);

	return (
		<Paper className="p-6">
			<Typography
				variant="h6"
				className="mb-4"
			>
				{title}
			</Typography>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>訂單編號</TableCell>
							<TableCell>請款編號</TableCell>
							<TableCell>請款日期</TableCell>
							<TableCell>請款類型</TableCell>
							<TableCell>供應商</TableCell>
							<TableCell>備註</TableCell>
							<TableCell align="right">金額</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{sortedInvoiceItems.map((item, idx) => (
							<TableRow key={`${item.invoiceNumber}-${item.id}-${idx}`}>
								<TableCell>{item.orderNumber || '-'}</TableCell>
								<TableCell>{item.invoiceNumber}</TableCell>
								<TableCell>{format(new Date(item.invoiceDate), 'yyyy/MM/dd')}</TableCell>
								<TableCell>{INVOICE_ITEM_TYPE_NAMES[item.invoiceType] || '未知類型'}</TableCell>
								<TableCell>{getSupplierName(item.payFor) || '-'}</TableCell>
								<TableCell>{item.note || '-'}</TableCell>
								<TableCell align="right">{(item.price * item.quantity).toLocaleString()}</TableCell>
							</TableRow>
						))}
						<TableRow>
							<TableCell
								colSpan={6}
								align="right"
							>
								<Typography
									variant="subtitle1"
									fontWeight="bold"
								>
									總計
								</Typography>
							</TableCell>
							<TableCell align="right">
								<Typography
									variant="subtitle1"
									fontWeight="bold"
								>
									{totalAmount.toLocaleString()}
								</Typography>
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</TableContainer>
		</Paper>
	);
}

export default InvoicesTableSimple;
