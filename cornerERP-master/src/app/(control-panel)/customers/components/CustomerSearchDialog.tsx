'use client';

import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid } from '@mui/material';

interface CustomerSearchDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: (params: Record<string, unknown>) => void;
	initialValues?: Record<string, unknown>;
}

function CustomerSearchDialog({ open, onClose, onConfirm, initialValues = {} }: CustomerSearchDialogProps) {
	const [searchParams, setSearchParams] = useState({
		query: initialValues.query || '',
		phone: initialValues.phone || '',
		email: initialValues.email || ''
	});

	const handleConfirm = () => {
		// 過濾掉空值
		const filteredParams = Object.entries(searchParams).reduce<Record<string, unknown>>((acc, [key, value]) => {
			if (value) {
				acc[key] = value;
			}

			return acc;
		}, {});

		onConfirm(filteredParams);
	};

	const handleReset = () => {
		setSearchParams({
			query: '',
			phone: '',
			email: ''
		});
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle>進階搜尋</DialogTitle>
			<DialogContent>
				<Grid
					container
					spacing={2}
					className="mt-4"
				>
					<Grid
						item
						xs={12}
					>
						<TextField
							fullWidth
							label="姓名或身份證號"
							value={searchParams.query}
							onChange={(e) => setSearchParams({ ...searchParams, query: e.target.value })}
							placeholder="請輸入姓名或身份證號"
						/>
					</Grid>
					<Grid
						item
						xs={12}
					>
						<TextField
							fullWidth
							label="電話"
							value={searchParams.phone}
							onChange={(e) => setSearchParams({ ...searchParams, phone: e.target.value })}
							placeholder="請輸入電話號碼"
						/>
					</Grid>
					<Grid
						item
						xs={12}
					>
						<TextField
							fullWidth
							label="Email"
							value={searchParams.email}
							onChange={(e) => setSearchParams({ ...searchParams, email: e.target.value })}
							placeholder="請輸入 Email"
						/>
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleReset}>重置</Button>
				<Button onClick={onClose}>取消</Button>
				<Button
					onClick={handleConfirm}
					variant="contained"
					color="primary"
				>
					搜尋
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default CustomerSearchDialog;
