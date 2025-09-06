'use client';

import { useState, useEffect } from 'react';
import {
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Typography,
	Autocomplete
} from '@mui/material';
import { Customer } from '@/app/(control-panel)/customers/CustomerApi';
import { formatPhoneNumber } from '@/utils/formatters';

interface CustomerSearchDialogProps {
	open: boolean;
	onClose: () => void;
	onSave: (customerId: string) => void;
	initialCustomerId: string;
	customers: Customer[] | undefined;
}

function CustomerSearchDialog({ open, onClose, onSave, initialCustomerId, customers = [] }: CustomerSearchDialogProps) {
	const [searchText, setSearchText] = useState('');
	const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId);

	// 使用 useEffect 來處理對話框開啟時的初始化
	useEffect(() => {
		if (open) {
			setSelectedCustomerId(initialCustomerId);
		}
	}, [open, initialCustomerId]);

	// 過濾搜尋結果
	const filteredCustomers = customers
		? customers.filter(
				(customer) =>
					customer.name.includes(searchText) ||
					customer.id.includes(searchText) ||
					(customer.phone && customer.phone.includes(searchText))
			)
		: [];

	const handleSave = () => {
		onSave(selectedCustomerId);
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle>搜尋客戶</DialogTitle>
			<DialogContent>
				{customers && (
					<Autocomplete
						className="pt-2"
						options={filteredCustomers}
						getOptionLabel={(option) => `${option.name} (${option.id})`}
						value={filteredCustomers.find((c) => c.id === selectedCustomerId) || null}
						onChange={(_, newValue) => {
							setSelectedCustomerId(newValue?.id || '');
						}}
						renderInput={(params) => (
							<TextField
								{...params}
								label="選擇客戶"
								variant="outlined"
							/>
						)}
						renderOption={(props, option) => {
							const { key, ...otherProps } = props;
							return (
								<li
									key={key}
									{...otherProps}
								>
									<div>
										<Typography variant="body1">{option.name}</Typography>
										<Typography
											variant="caption"
											color="textSecondary"
										>
											ID: {option.id} | 電話: {formatPhoneNumber(option.phone) || '無'}
										</Typography>
									</div>
								</li>
							);
						}}
						fullWidth
					/>
				)}
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
				>
					確認選擇
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default CustomerSearchDialog;
