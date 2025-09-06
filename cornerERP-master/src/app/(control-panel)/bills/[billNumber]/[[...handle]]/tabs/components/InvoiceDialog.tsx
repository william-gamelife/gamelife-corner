import { Dialog, DialogTitle, DialogContent, Box, IconButton, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import InvoicesTable from '@/app/(control-panel)/groups/[groupCode]/[[...handle]]/tabs/components/InvoicesTable';
import { Invoice } from '@/app/(control-panel)/invoices/InvoiceApi';

interface InvoiceDialogProps {
	isOpen: boolean;
	onClose: () => void;
	selectedInvoice: Invoice | null;
	onDataRefresh?: () => void;
}

export function InvoiceDialog({ isOpen, onClose, selectedInvoice, onDataRefresh }: InvoiceDialogProps) {
	return (
		<Dialog
			open={isOpen}
			onClose={onClose}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle>
				<Box
					display="flex"
					justifyContent="space-between"
					alignItems="center"
				>
					<Typography variant="h6">請款單詳細內容</Typography>
					<IconButton onClick={onClose}>
						<FuseSvgIcon>heroicons-solid:x-mark</FuseSvgIcon>
					</IconButton>
				</Box>
			</DialogTitle>
			<DialogContent>
				{selectedInvoice && (
					<InvoicesTable
						invoices={[selectedInvoice]}
						title={`請款單編號：${selectedInvoice.invoiceNumber}`}
						allowEdit={true}
						onDataRefresh={onDataRefresh}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}
