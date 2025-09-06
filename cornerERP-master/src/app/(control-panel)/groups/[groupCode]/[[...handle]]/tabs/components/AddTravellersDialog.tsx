'use client';

import { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography } from '@mui/material';

interface AddTravellersDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: (count: number) => void;
}

function AddTravellersDialog({ open, onClose, onConfirm }: AddTravellersDialogProps) {
	const [count, setCount] = useState<number>(1);
	const [error, setError] = useState<string>('');

	const handleCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(event.target.value, 10);

		if (isNaN(value) || value < 1) {
			setError('請輸入至少 1 位旅客');
			setCount(1);
		} else if (value > 50) {
			setError('一次最多新增 50 位旅客');
			setCount(50);
		} else {
			setError('');
			setCount(value);
		}
	};

	const handleConfirm = () => {
		if (count >= 1 && count <= 50) {
			onConfirm(count);
			onClose();
			// 重置為預設值
			setCount(1);
			setError('');
		}
	};

	const handleClose = () => {
		onClose();
		// 重置為預設值
		setCount(1);
		setError('');
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="xs"
			fullWidth
		>
			<DialogTitle>新增旅客</DialogTitle>
			<DialogContent>
				<div className="mt-2">
					<Typography
						variant="body2"
						color="textSecondary"
						className="mb-4"
					>
						請輸入要新增的旅客數量
					</Typography>
					<TextField
						label="旅客數量"
						type="number"
						variant="outlined"
						fullWidth
						value={count}
						onChange={handleCountChange}
						inputProps={{
							min: 1,
							max: 50,
							step: 1
						}}
						error={!!error}
						helperText={error}
						autoFocus
					/>
				</div>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={handleClose}
					color="primary"
				>
					取消
				</Button>
				<Button
					onClick={handleConfirm}
					color="primary"
					variant="contained"
					disabled={!!error}
				>
					確認新增 {count} 位旅客
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default AddTravellersDialog;
