import { Typography } from '@mui/material';
import { format } from 'date-fns';
import { BILL_PREVIEW_TEXT } from '@/constants/billConstants';

interface BillPreviewHeaderProps {
	billNumber: string;
	billDate: Date | string | null;
}

/**
 * 出納單預覽標頭組件
 */
export function BillPreviewHeader({ billNumber, billDate }: BillPreviewHeaderProps) {
	// 格式化日期顯示
	const formattedDate = billDate ? format(new Date(billDate), 'yyyy-MM-dd') : '';

	return (
		<div className="flex justify-between">
			<div>
				<table className="mb-2">
					<tbody>
						<tr>
							<td className="pb-4">
								<Typography
									className="font-light"
									variant="h6"
									color="text.secondary"
								>
									{BILL_PREVIEW_TEXT.BILL_NUMBER}
								</Typography>
							</td>
							<td className="pb-4 px-8">
								<Typography
									className="font-light"
									variant="h6"
									color="inherit"
								>
									{billNumber}
								</Typography>
							</td>
						</tr>
					</tbody>
				</table>

				<Typography color="text.secondary">{`${BILL_PREVIEW_TEXT.BILL_DATE}: ${formattedDate}`}</Typography>
			</div>
		</div>
	);
}
