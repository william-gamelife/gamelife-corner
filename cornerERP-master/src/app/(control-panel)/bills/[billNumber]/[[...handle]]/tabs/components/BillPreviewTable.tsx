import { Typography, Table, TableBody, TableCell, TableHead, TableRow, TableFooter } from '@mui/material';
import { InvoiceGroup } from '@/utils/calculations';
import { BILL_PREVIEW_TEXT } from '@/constants/billConstants';

interface BillPreviewTableProps {
	invoiceGroups: InvoiceGroup[];
	totalAmount: number;
	showPayFor?: boolean;
}

/**
 * 出納單預覽表格組件
 */
export function BillPreviewTable({ invoiceGroups, totalAmount, showPayFor = true }: BillPreviewTableProps) {
	return (
		<Table
			id="pdfTable"
			className="simple"
		>
			<TableHead>
				<TableRow>
					{showPayFor && <TableCell>{BILL_PREVIEW_TEXT.PAY_FOR}</TableCell>}
					<TableCell>{BILL_PREVIEW_TEXT.INVOICE_NUMBER}</TableCell>
					<TableCell>{BILL_PREVIEW_TEXT.INVOICE_PERSON}</TableCell>
					<TableCell>{BILL_PREVIEW_TEXT.GROUP_NAME}</TableCell>
					<TableCell>{BILL_PREVIEW_TEXT.ITEM}</TableCell>
					<TableCell align="right">{BILL_PREVIEW_TEXT.PAYABLE}</TableCell>
					<TableCell align="right">{BILL_PREVIEW_TEXT.SUM}</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{invoiceGroups.map((group, idx) =>
					group.invoices.map((invoice, subIdx) => (
						<TableRow key={`${idx}_${subIdx}`}>
							{showPayFor && subIdx === 0 && (
								<TableCell rowSpan={group.invoices.length}>
									<Typography variant="subtitle1">{group.payFor}</Typography>
								</TableCell>
							)}
							<TableCell className={showPayFor ? 'noPL' : ''}>
								<Typography variant="subtitle1">{invoice.invoiceNumber}</Typography>
							</TableCell>
							<TableCell>
								<Typography variant="subtitle1">{invoice.createdBy}</Typography>
							</TableCell>
							<TableCell>
								<Typography variant="subtitle1">{invoice.groupName}</Typography>
							</TableCell>
							<TableCell>
								<Typography variant="subtitle1">{invoice.note}</Typography>
							</TableCell>
							<TableCell
								align="right"
								className={subIdx !== 0 ? 'noPR' : ''}
							>
								{invoice.price.toLocaleString()}
							</TableCell>
							{subIdx === 0 && (
								<TableCell
									align="right"
									rowSpan={group.invoices.length}
								>
									{group.hiddenTotal ? '' : group.total.toLocaleString()}
								</TableCell>
							)}
						</TableRow>
					))
				)}
			</TableBody>
			<TableFooter>
				<TableRow>
					<TableCell
						colSpan={showPayFor ? 5 : 4}
						align="left"
					>
						<Typography
							className="font-light"
							variant="h4"
							color="text.secondary"
						>
							TOTAL
						</Typography>
					</TableCell>
					<TableCell
						colSpan={2}
						align="right"
					>
						<Typography
							className="font-light"
							variant="h4"
							color="text.secondary"
						>
							{totalAmount.toLocaleString()}
						</Typography>
					</TableCell>
				</TableRow>
			</TableFooter>
		</Table>
	);
}
