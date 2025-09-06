'use client';

import { useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import { InvoiceItem, useUpdateInvoiceItemMutation } from '@/app/(control-panel)/invoices/InvoiceApi';
import { INVOICE_ITEM_TYPE_NAMES } from '@/constants/invoiceItemTypes';
import { useSupplierDictionary } from '@/app/(control-panel)/suppliers/hooks/useSupplierDictionary';
import InvoiceItemDialog from '@/app/(control-panel)/invoices/[invoiceNumber]/[[...handle]]/components/InvoiceItemDialog';
import { useGetSuppliersQuery } from '@/app/(control-panel)/suppliers/SupplierApi';
import { useSnackbar } from 'notistack';

interface InvoiceItemsExpandableRowProps {
	invoiceItems: InvoiceItem[];
	invoiceNumber: string;
	open: boolean;
	onToggle: () => void;
	onItemUpdated?: () => void; // 當項目更新後的回調
	allowEdit?: boolean; // 是否允許編輯
}

function InvoiceItemsExpandableRow({
	invoiceItems,
	invoiceNumber,
	open,
	onToggle: _onToggle,
	onItemUpdated,
	allowEdit = false
}: InvoiceItemsExpandableRowProps) {
	const { getSupplierName } = useSupplierDictionary();
	const { data: suppliers = [] } = useGetSuppliersQuery();
	const [updateInvoiceItem] = useUpdateInvoiceItemMutation();
	const { enqueueSnackbar } = useSnackbar();

	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null);

	// 處理編輯項目
	const handleEditItem = (item: InvoiceItem) => {
		// 確保 item 包含 id
		console.log('Editing item with id:', item.id);

		if (!item.id) {
			console.error('Cannot edit item without id:', item);
			enqueueSnackbar('編輯失敗：項目缺少 ID', { variant: 'error' });
			return;
		}

		setEditingItem(item);
		setIsEditDialogOpen(true);
	};

	// 處理保存編輯的項目
	const handleSaveItem = async (updatedItem: InvoiceItem) => {
		// 確保有 ID 才能更新
		if (!updatedItem.id) {
			console.error('Cannot update item without id:', updatedItem);
			enqueueSnackbar('更新失敗：項目缺少 ID', { variant: 'error' });
			return;
		}

		console.log('Updating item with id:', updatedItem.id, 'for invoice:', invoiceNumber);

		try {
			await updateInvoiceItem({
				invoiceNumber,
				item: updatedItem
			}).unwrap();

			enqueueSnackbar('請款項目已成功更新', { variant: 'success' });
			setIsEditDialogOpen(false);
			setEditingItem(null);

			// 通知父組件重新獲取數據
			if (onItemUpdated) {
				onItemUpdated();
			}
		} catch (error) {
			console.error('Failed to update invoice item:', error);
			enqueueSnackbar('更新請款項目失敗', { variant: 'error' });
		}
	};

	return (
		<>
			<TableRow>
				<TableCell
					style={{ paddingBottom: 0, paddingTop: 0 }}
					colSpan={7}
				>
					<Collapse
						in={open}
						timeout="auto"
						unmountOnExit
					>
						<Box sx={{ margin: 2 }}>
							<Typography
								variant="subtitle2"
								component="div"
								className="font-medium mb-3"
							>
								請款項目明細
							</Typography>

							{invoiceItems.length > 0 ? (
								<Table
									size="small"
									className="border rounded-lg"
								>
									<TableHead className="bg-gray-50">
										<TableRow>
											<TableCell className="font-medium">請款類型</TableCell>
											<TableCell className="font-medium">供應商</TableCell>
											<TableCell
												className="font-medium"
												align="right"
											>
												單價
											</TableCell>
											<TableCell
												className="font-medium"
												align="right"
											>
												數量
											</TableCell>
											<TableCell
												className="font-medium"
												align="right"
											>
												小計
											</TableCell>
											<TableCell className="font-medium">備註</TableCell>
											{allowEdit && (
												<TableCell
													className="font-medium"
													align="right"
												>
													操作
												</TableCell>
											)}
										</TableRow>
									</TableHead>
									<TableBody>
										{invoiceItems.map((item) => (
											<TableRow key={item.id}>
												<TableCell>
													{INVOICE_ITEM_TYPE_NAMES[item.invoiceType] || '未知類型'}
												</TableCell>
												<TableCell>{getSupplierName(item.payFor) || '-'}</TableCell>
												<TableCell align="right">{item.price.toLocaleString()}</TableCell>
												<TableCell align="right">{item.quantity}</TableCell>
												<TableCell align="right">
													{(item.price * item.quantity).toLocaleString()}
												</TableCell>
												<TableCell>{item.note || '-'}</TableCell>
												{allowEdit && (
													<TableCell align="right">
														<Tooltip title="編輯請款項目">
															<IconButton
																size="small"
																color="primary"
																onClick={() => handleEditItem(item)}
															>
																<EditIcon fontSize="small" />
															</IconButton>
														</Tooltip>
													</TableCell>
												)}
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<div className="text-center p-4 bg-gray-50 border rounded-lg">
									<Typography color="textSecondary">目前沒有請款項目</Typography>
								</div>
							)}
						</Box>
					</Collapse>
				</TableCell>
			</TableRow>

			{/* 編輯對話框 */}
			<InvoiceItemDialog
				open={isEditDialogOpen}
				onClose={() => {
					setIsEditDialogOpen(false);
					setEditingItem(null);
				}}
				onSave={handleSaveItem}
				editingItem={editingItem}
				invoiceNumber={invoiceNumber}
				suppliers={suppliers}
			/>
		</>
	);
}

export default InvoiceItemsExpandableRow;
