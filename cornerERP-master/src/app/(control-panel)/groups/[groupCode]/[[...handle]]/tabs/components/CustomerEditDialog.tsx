'use client';

import { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Customer } from '@/app/(control-panel)/customers/CustomerApi';
import { formatDateForAPI } from '@/utils/timezone';

interface CustomerEditDialogProps {
	open: boolean;
	onClose: () => void;
	onSave: (customer: Customer) => void;
	customer: Customer | null;
	isNew: boolean;
}

function CustomerEditDialog({ open, onClose, onSave, customer, isNew }: CustomerEditDialogProps) {
	const [editedCustomer, setEditedCustomer] = useState<Customer | null>(customer);
	const [isChecking, setIsChecking] = useState(false);

	// 當客戶資料變更時更新狀態
	useEffect(() => {
		if (open && customer) {
			setEditedCustomer({ ...customer });
		}
	}, [customer, open]);

	// 處理表單欄位變更
	const handleChange = (field: keyof Customer, value: string) => {
		if (editedCustomer) {
			setEditedCustomer({
				...editedCustomer,
				[field]: value
			});

			// 當 ID 變更且是新增模式時，檢查 API 是否已存在該客戶
			if (field === 'id' && isNew && value && value.length >= 10) {
				checkCustomerExists(value);
			}
		}
	};

	// 處理生日日期變更
	const handleBirthdayChange = (date: Date | null) => {
		if (editedCustomer) {
			const dateString = formatDateForAPI(date) || '';
			setEditedCustomer({
				...editedCustomer,
				birthday: dateString
			});
		}
	};

	// 檢查客戶 ID 是否已存在於系統中
	const checkCustomerExists = async (id: string) => {
		try {
			setIsChecking(true);
			const response = await fetch(`/api/supabase/customers/${id}`);

			if (response.ok) {
				const data = await response.json();

				if (data?.customer) {
					// 找到客戶資料，自動填充其他欄位
					setEditedCustomer({
						...data.customer,
						// 保留可能已經修改過的欄位
						note: editedCustomer?.note || data.customer.note
					});
				}
			}
		} catch (error) {
			console.error('檢查客戶資料時發生錯誤:', error);
		} finally {
			setIsChecking(false);
		}
	};

	// 處理保存
	const handleSave = () => {
		if (editedCustomer) {
			onSave(editedCustomer);
		}
	};

	// 如果沒有客戶資料，不顯示對話框內容
	if (!editedCustomer) {
		return (
			<Dialog
				open={open}
				onClose={onClose}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>載入中...</DialogTitle>
			</Dialog>
		);
	}

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle>{isNew ? '新增旅客資料' : '編輯旅客資料'}</DialogTitle>
			<DialogContent>
				<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2, mt: 2 }}>
					{/* 姓名 */}
					<Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
						<TextField
							label="姓名"
							variant="outlined"
							fullWidth
							required
							value={editedCustomer.name || ''}
							onChange={(e) => handleChange('name', e.target.value)}
						/>
					</Box>
					{/* 身份證號 */}
					<Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
						<TextField
							label="身份證號"
							variant="outlined"
							fullWidth
							required
							value={editedCustomer.id || ''}
							onChange={(e) => handleChange('id', e.target.value)}
							disabled={!isNew || isChecking} // 如果不是新增或正在檢查中，則禁止編輯ID
							helperText={isNew ? '輸入身份證號後將自動檢查是否已存在' : ''}
						/>
					</Box>
					{/* 生日 */}
					<Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
						<DatePicker
							label="生日"
							format="yyyy-MM-dd"
							value={editedCustomer.birthday ? new Date(editedCustomer.birthday) : null}
							onChange={handleBirthdayChange}
							slotProps={{
								textField: {
									fullWidth: true,
									variant: 'outlined'
								}
							}}
						/>
					</Box>
					{/* 護照拼音 */}
					<Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
						<TextField
							label="護照拼音"
							variant="outlined"
							fullWidth
							value={editedCustomer.passportRomanization || ''}
							onChange={(e) => handleChange('passportRomanization', e.target.value)}
						/>
					</Box>
					{/* 護照號碼 */}
					<Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
						<TextField
							label="護照號碼"
							variant="outlined"
							fullWidth
							value={editedCustomer.passportNumber || ''}
							onChange={(e) => handleChange('passportNumber', e.target.value)}
						/>
					</Box>
					{/* 護照效期訖 */}
					<Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
						<DatePicker
							label="護照效期訖"
							format="yyyy-MM-dd"
							value={editedCustomer.passportValidTo ? new Date(editedCustomer.passportValidTo) : null}
							onChange={(date) => handleChange('passportValidTo', formatDateForAPI(date) || '')}
							slotProps={{
								textField: {
									fullWidth: true,
									variant: 'outlined'
								}
							}}
						/>
					</Box>
					{/* 聯絡電話 */}
					<Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
						<TextField
							label="聯絡電話"
							variant="outlined"
							fullWidth
							value={editedCustomer.phone || ''}
							onChange={(e) => handleChange('phone', e.target.value)}
						/>
					</Box>
					{/* 電子郵件 */}
					<Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
						<TextField
							label="電子郵件"
							variant="outlined"
							fullWidth
							type="email"
							value={editedCustomer.email || ''}
							onChange={(e) => handleChange('email', e.target.value)}
						/>
					</Box>
					<Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
						<TextField
							label="備註"
							variant="outlined"
							fullWidth
							multiline
							rows={2}
							value={editedCustomer.note || ''}
							onChange={(e) => handleChange('note', e.target.value)}
						/>
					</Box>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={onClose}
					color="primary"
				>
					取消
				</Button>
				<Button
					onClick={handleSave}
					color="primary"
					variant="contained"
					disabled={!editedCustomer.id || !editedCustomer.name || isChecking}
				>
					儲存
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default CustomerEditDialog;
