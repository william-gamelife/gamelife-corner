import { Typography, Card, CardContent } from '@mui/material';
import { InvoiceGroup } from '@/utils/calculations';
import { BillPreviewRoot } from './BillPreviewStyles';
import { BillPreviewHeader } from './BillPreviewHeader';
import { BillPreviewTable } from './BillPreviewTable';

interface BillPreviewContainerProps {
	billNumber: string;
	billDate: Date | string | null;
	invoiceGroups: InvoiceGroup[];
	totalAmount: number;
	cardId?: string;
	showPayFor?: boolean;
}

/**
 * 出納單預覽容器組件
 * 整合標頭、表格等子組件，提供完整的預覽功能
 */
export function BillPreviewContainer({
	billNumber,
	billDate,
	invoiceGroups,
	totalAmount,
	cardId = 'preview',
	showPayFor = true
}: BillPreviewContainerProps) {
	return (
		<BillPreviewRoot className="grow shrink-0 p-0">
			<Card
				id={cardId}
				className="mx-auto shadow-0"
				style={{ boxShadow: 'unset' }}
			>
				<CardContent className="print:p-0">
					<Typography
						color="text.secondary"
						className="mb-12"
					>
						{/* 預留位置，原本的註解日期 */}
					</Typography>

					<BillPreviewHeader
						billNumber={billNumber}
						billDate={billDate}
					/>

					<div className="mt-8">
						<BillPreviewTable
							invoiceGroups={invoiceGroups}
							totalAmount={totalAmount}
							showPayFor={showPayFor}
						/>
					</div>
				</CardContent>
			</Card>
		</BillPreviewRoot>
	);
}
