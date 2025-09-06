import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { MenuItem } from '@mui/material';
import { Select } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import { InputLabel } from '@mui/material';
import { GetEsimsApiArg } from '../EsimApi';

interface EsimSearchDialogProps {
	open: boolean;
	onClose: () => void;
	onSearch: (params: GetEsimsApiArg) => void;
	initialParams: GetEsimsApiArg;
}

// 狀態選項
const STATUS_OPTIONS = [
	{ value: 0, label: '待確認' },
	{ value: 1, label: '已確認' },
	{ value: 2, label: '錯誤' }
];

export default function EsimSearchDialog({ open, onClose, onSearch, initialParams }: EsimSearchDialogProps) {
	const [params, setParams] = useState(initialParams);

	useEffect(() => {
		if (open) {
			setParams(initialParams);
		}
	}, [open, initialParams]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setParams((prev) => ({
			...prev,
			[name]: value
		}));
	};

	const handleStatusChange = (event) => {
		const {
			target: { value }
		} = event;
		setParams({
			...params,
			status: value === '' ? undefined : Number(value)
		});
	};

	const handleSubmit = () => {
		onSearch(params);
		onClose();
	};

	const handleReset = () => {
		const defaultParams: GetEsimsApiArg = {};
		setParams(defaultParams);
		onSearch(defaultParams);
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle>詳細搜尋網卡</DialogTitle>
			<DialogContent>
				<Grid
					container
					spacing={2}
					sx={{ mt: 1 }}
				>
					<Grid
						item
						xs={12}
						md={6}
					>
						<TextField
							name="esimNumber"
							label="網卡單號"
							value={params.esimNumber || ''}
							onChange={handleChange}
							fullWidth
							variant="outlined"
							size="small"
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<TextField
							name="groupCode"
							label="團號"
							value={params.groupCode || ''}
							onChange={handleChange}
							fullWidth
							variant="outlined"
							size="small"
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<TextField
							name="orderNumber"
							label="訂單編號"
							value={params.orderNumber || ''}
							onChange={handleChange}
							fullWidth
							variant="outlined"
							size="small"
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<TextField
							name="supplierOrderNumber"
							label="供應商訂單編號"
							value={params.supplierOrderNumber || ''}
							onChange={handleChange}
							fullWidth
							variant="outlined"
							size="small"
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<TextField
							name="productId"
							label="商品Id"
							value={params.productId || ''}
							onChange={handleChange}
							fullWidth
							variant="outlined"
							size="small"
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<TextField
							name="email"
							label="信箱"
							type="email"
							value={params.email || ''}
							onChange={handleChange}
							fullWidth
							variant="outlined"
							size="small"
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<FormControl
							fullWidth
							size="small"
						>
							<InputLabel id="status-label">狀態</InputLabel>
							<Select
								labelId="status-label"
								id="status"
								value={params.status ?? ''}
								onChange={handleStatusChange}
								label="狀態"
							>
								<MenuItem value="">全部</MenuItem>
								{STATUS_OPTIONS.map((option) => (
									<MenuItem
										key={option.value}
										value={option.value}
									>
										{option.label}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={handleReset}
					color="inherit"
				>
					重設
				</Button>
				<Button onClick={onClose}>取消</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					color="primary"
				>
					搜尋
				</Button>
			</DialogActions>
		</Dialog>
	);
}
