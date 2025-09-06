import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox } from '@mui/material';
import { format } from 'date-fns';
import { Invoice } from '@/app/(control-panel)/invoices/InvoiceApi';
import { INVOICE_STATUS } from 'src/constants/invoiceStatus';

interface InvoiceTableProps {
	invoices: Invoice[];
	selectedInvoiceNumbers: string[];
	onInvoiceSelectionChange: (invoiceNumber: string, isSelected: boolean) => void;
	onInvoiceClick: (invoice: Invoice) => void;
	isAllSelected: boolean;
	onSelectAll: (checked: boolean) => void;
	isReadOnly: boolean;
	getUserName: (userId: string) => string;
}

export function InvoiceTable({
	invoices,
	selectedInvoiceNumbers,
	onInvoiceSelectionChange,
	onInvoiceClick,
	isAllSelected,
	onSelectAll,
	isReadOnly,
	getUserName
}: InvoiceTableProps) {
	const renderInvoices = () => {
		if (invoices.length === 0) {
			return (
				<TableRow>
					<TableCell
						colSpan={7}
						align="center"
					>
						沒有可用的請款單
					</TableCell>
				</TableRow>
			);
		}

		return invoices.map((invoice) => {
			const isSelected = selectedInvoiceNumbers.includes(invoice.invoiceNumber);
			const isDisabled = false;

			const totalAmount = invoice.invoiceItems
				? invoice.invoiceItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
				: 0;

			const groupName = invoice.groupName || '';

			const formattedDate =
				invoice.invoiceDate instanceof Date
					? format(invoice.invoiceDate, 'yyyy-MM-dd')
					: typeof invoice.invoiceDate === 'string'
						? invoice.invoiceDate
						: '';

			return (
				<TableRow
					key={invoice.invoiceNumber}
					hover
					selected={isSelected}
					style={{ opacity: isDisabled ? 0.5 : 1 }}
				>
					<TableCell padding="checkbox">
						<Checkbox
							checked={isSelected}
							disabled={isDisabled || isReadOnly}
							onChange={(e) => onInvoiceSelectionChange(invoice.invoiceNumber, e.target.checked)}
						/>
					</TableCell>
					<TableCell
						onClick={() => onInvoiceClick(invoice)}
						sx={{ cursor: 'pointer', color: 'primary.main', textDecoration: 'underline' }}
					>
						{invoice.invoiceNumber}
					</TableCell>
					<TableCell>{groupName}</TableCell>
					<TableCell>{formattedDate}</TableCell>
					<TableCell>{getUserName(invoice.createdBy)}</TableCell>
					<TableCell>{totalAmount.toLocaleString()}</TableCell>
					<TableCell>
						{invoice.status === INVOICE_STATUS.PENDING && '待確認'}
						{invoice.status === INVOICE_STATUS.CONFIRMED && '已確認'}
						{invoice.status === INVOICE_STATUS.BILLED && '已出帳'}
					</TableCell>
				</TableRow>
			);
		});
	};

	return (
		<TableContainer component={Paper}>
			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell padding="checkbox">
							<Checkbox
								checked={isAllSelected}
								indeterminate={selectedInvoiceNumbers.length > 0 && !isAllSelected}
								onChange={(e) => onSelectAll(e.target.checked)}
								disabled={isReadOnly}
							/>
						</TableCell>
						<TableCell>請款編號</TableCell>
						<TableCell>團名</TableCell>
						<TableCell>出帳日期</TableCell>
						<TableCell>請款人</TableCell>
						<TableCell>總金額</TableCell>
						<TableCell>狀態</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>{renderInvoices()}</TableBody>
			</Table>
		</TableContainer>
	);
}
