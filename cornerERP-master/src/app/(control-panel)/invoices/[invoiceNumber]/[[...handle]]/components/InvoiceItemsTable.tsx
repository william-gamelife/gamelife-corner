'use client';

import { useState } from 'react';
import {
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { InvoiceItem } from '@/app/(control-panel)/invoices/InvoiceApi';
import { getInvoiceItemTypeName } from 'src/constants/invoiceItemTypes';
import InvoiceItemDialog from './InvoiceItemDialog';

type InvoiceItemsTableProps = {
	items: InvoiceItem[];
	onItemsChange: (items: InvoiceItem[]) => void;
	invoiceNumber: string;
	suppliers: any[];
	isDisabled?: boolean;
};

export default function InvoiceItemsTable({
	items,
	onItemsChange,
	invoiceNumber,
	suppliers,
	isDisabled = false
}: InvoiceItemsTableProps) {
	const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null);

	// 打開新增項目對話框
	const handleAddItem = () => {
		setEditingItem(null);
		setIsItemDialogOpen(true);
	};

	// 打開編輯項目對話框
	const handleEditItem = (item: InvoiceItem) => {
		setEditingItem(item);
		setIsItemDialogOpen(true);
	};

	// 刪除項目
	const handleDeleteItem = (itemId: number) => {
		if (confirm('確定要刪除此項目嗎？')) {
			const updatedItems = items.filter((item) => item.id !== itemId);
			onItemsChange(updatedItems);
		}
	};

	// 保存項目
	const handleSaveItem = (item: InvoiceItem) => {
		if (editingItem) {
			// 更新現有項目
			const updatedItems = items.map((existingItem) => {
				if (existingItem.id === editingItem.id) {
					return item;
				}

				return existingItem;
			});
			onItemsChange(updatedItems);
		} else {
			// 新增項目
			onItemsChange([...items, item]);
		}

		setIsItemDialogOpen(false);
	};

	// 取得供應商名稱
	const getSupplierName = (supplierCode: string) => {
		const found = suppliers.find((s) => s.supplierCode === supplierCode);
		return found ? found.supplierName : supplierCode;
	};

	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-medium">請款項目</h3>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={handleAddItem}
					disabled={isDisabled}
				>
					新增項目
				</Button>
			</div>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>請款類型</TableCell>
							<TableCell>供應商</TableCell>
							<TableCell align="right">單價</TableCell>
							<TableCell align="right">數量</TableCell>
							<TableCell align="right">小計</TableCell>
							<TableCell>備註</TableCell>
							<TableCell align="right">操作</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{items.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={7}
									align="center"
								>
									尚無請款項目
								</TableCell>
							</TableRow>
						) : (
							items.map((item) => (
								<TableRow key={item.id}>
									<TableCell>{getInvoiceItemTypeName(item.invoiceType)}</TableCell>
									<TableCell>{getSupplierName(item.payFor)}</TableCell>
									<TableCell align="right">{item.price.toLocaleString()}</TableCell>
									<TableCell align="right">{item.quantity}</TableCell>
									<TableCell align="right">{(item.price * item.quantity).toLocaleString()}</TableCell>
									<TableCell>{item.note}</TableCell>
									<TableCell align="right">
										<IconButton
											size="small"
											color="primary"
											onClick={() => handleEditItem(item)}
											disabled={isDisabled}
										>
											<EditIcon />
										</IconButton>
										<IconButton
											size="small"
											color="error"
											onClick={() => handleDeleteItem(item.id)}
											disabled={isDisabled}
										>
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<InvoiceItemDialog
				open={isItemDialogOpen}
				onClose={() => setIsItemDialogOpen(false)}
				onSave={handleSaveItem}
				editingItem={editingItem}
				invoiceNumber={invoiceNumber}
				suppliers={suppliers}
			/>
		</div>
	);
}
