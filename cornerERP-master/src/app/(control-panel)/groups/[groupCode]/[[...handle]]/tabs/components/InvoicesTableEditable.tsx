import React, { useState } from 'react';
import {
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	TableContainer,
	Paper,
	Typography,
	IconButton,
	Tooltip
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Invoice } from '@/app/(control-panel)/invoices/InvoiceApi';
import { format } from 'date-fns';
import InvoiceItemsExpandableRow from './InvoiceItemsExpandableRow';
import { calculateInvoicesTotal, sortInvoicesByOrder } from './invoiceTableUtils';

interface InvoicesTableEditableProps {
	invoices: Invoice[];
	title?: string;
	allowEdit?: boolean;
	onDataRefresh?: () => void;
}

/**
 * 可編輯版本的發票表格組件
 * 支援展開/收合行來查看和編輯發票項目
 */
function InvoicesTableEditable({
	invoices,
	title = '團體支出明細',
	allowEdit = false,
	onDataRefresh
}: InvoicesTableEditableProps) {
	const [openRows, setOpenRows] = useState<Record<string, boolean>>({});
	const [_refreshKey, setRefreshKey] = useState(0);

	// 處理展開/收合行
	const handleToggleRow = (invoiceNumber: string) => {
		setOpenRows((prev) => ({
			...prev,
			[invoiceNumber]: !prev[invoiceNumber]
		}));
	};

	// 處理項目更新後的回調
	const handleItemUpdated = () => {
		setRefreshKey((prev) => prev + 1);
		onDataRefresh?.();
	};

	// 計算總金額
	const totalAmount = calculateInvoicesTotal(invoices);

	// 按訂單分組並排序
	const groupedInvoices = sortInvoicesByOrder(invoices);

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
							<TableCell>請款總金額</TableCell>
							<TableCell>請款項目數</TableCell>
							<TableCell>備註</TableCell>
							<TableCell align="right">操作</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{groupedInvoices.map((invoice) => {
							const invoiceTotal =
								invoice.invoiceItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
							const itemCount = invoice.invoiceItems?.length || 0;

							return (
								<React.Fragment key={invoice.invoiceNumber}>
									<TableRow hover>
										<TableCell>{invoice.orderNumber || '-'}</TableCell>
										<TableCell>{invoice.invoiceNumber}</TableCell>
										<TableCell>{format(new Date(invoice.invoiceDate), 'yyyy/MM/dd')}</TableCell>
										<TableCell align="right">{invoiceTotal.toLocaleString()}</TableCell>
										<TableCell align="right">{itemCount}</TableCell>
										<TableCell>
											{invoice.invoiceItems && invoice.invoiceItems.length > 0
												? `共 ${invoice.invoiceItems.length} 項請款項目`
												: '無請款項目'}
										</TableCell>
										<TableCell align="right">
											{invoice.invoiceItems && invoice.invoiceItems.length > 0 && (
												<Tooltip title="查看請款項目明細">
													<IconButton
														size="small"
														color="info"
														onClick={() => handleToggleRow(invoice.invoiceNumber)}
													>
														{openRows[invoice.invoiceNumber] ? (
															<KeyboardArrowUpIcon />
														) : (
															<KeyboardArrowDownIcon />
														)}
													</IconButton>
												</Tooltip>
											)}
										</TableCell>
									</TableRow>
									{invoice.invoiceItems && invoice.invoiceItems.length > 0 && (
										<InvoiceItemsExpandableRow
											invoiceItems={invoice.invoiceItems}
											invoiceNumber={invoice.invoiceNumber}
											open={!!openRows[invoice.invoiceNumber]}
											onToggle={() => handleToggleRow(invoice.invoiceNumber)}
											onItemUpdated={handleItemUpdated}
											allowEdit={allowEdit}
										/>
									)}
								</React.Fragment>
							);
						})}
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

export default InvoicesTableEditable;
