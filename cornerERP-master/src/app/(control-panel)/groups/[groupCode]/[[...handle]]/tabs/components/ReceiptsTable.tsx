import { Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Typography } from '@mui/material';
import { Receipt } from '@/app/(control-panel)/receipts/ReceiptApi';
import { format } from 'date-fns';
import { RECEIPT_TYPE_NAMES } from '@/constants/receiptTypes';

interface ReceiptsTableProps {
	receipts: Receipt[];
}

function ReceiptsTable({ receipts }: ReceiptsTableProps) {
	// 計算總金額
	const totalAmount = receipts.reduce((sum, receipt) => sum + (receipt.actualAmount || 0), 0);

	return (
		<Paper className="p-6">
			<Typography
				variant="h6"
				className="mb-4"
			>
				團體收款明細
			</Typography>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>訂單編號</TableCell>
							<TableCell>收款編號</TableCell>
							<TableCell>收款日期</TableCell>
							<TableCell>收款方式</TableCell>
							<TableCell>備註</TableCell>
							<TableCell align="right">實收金額</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{receipts.map((receipt) => (
							<TableRow key={receipt.receiptNumber}>
								<TableCell>{receipt.orderNumber || '-'}</TableCell>
								<TableCell>{receipt.receiptNumber}</TableCell>
								<TableCell>{format(new Date(receipt.receiptDate), 'yyyy/MM/dd')}</TableCell>
								<TableCell>
									{RECEIPT_TYPE_NAMES[receipt.receiptType]
										? `${RECEIPT_TYPE_NAMES[receipt.receiptType]}: ${receipt.receiptAccount}`
										: receipt.note || '其他'}
								</TableCell>
								<TableCell>{RECEIPT_TYPE_NAMES[receipt.receiptType] ? receipt.note : ''}</TableCell>
								<TableCell align="right">{(receipt.actualAmount || 0).toLocaleString()}</TableCell>
							</TableRow>
						))}
						<TableRow>
							<TableCell
								colSpan={5}
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

export default ReceiptsTable;
