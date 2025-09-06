import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Grid from '@mui/material/Grid';
import { RECEIPT_STATUS, RECEIPT_STATUS_NAMES } from '@/constants/receiptStatus';
import { RECEIPT_TYPE_NAMES } from '@/constants/receiptTypes';
import { format } from 'date-fns';
interface ReceiptSearchDialogProps {
	open: boolean;
	onClose: () => void;
	onSearch: (params: any) => void;
	initialParams: any;
}

export default function ReceiptSearchDialog({ open, onClose, onSearch, initialParams }: ReceiptSearchDialogProps) {
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

	const handleDateChange = (name: string, date: Date | null) => {
		setParams((prev) => ({
			...prev,
			[name]: format(date, 'yyyy-MM-dd')
		}));
	};

	const handleStatusChange = (event) => {
		const {
			target: { value }
		} = event;
		setParams({
			...params,
			status: typeof value === 'string' ? value.split(',').map(Number) : value
		});
	};

	const handleTypeChange = (event) => {
		const {
			target: { value }
		} = event;
		setParams({
			...params,
			receiptType: typeof value === 'string' ? value.split(',').map(Number) : value
		});
	};

	const handleSubmit = () => {
		onSearch(params);
		onClose();
	};

	const handleReset = () => {
		const defaultParams = {
			status: [RECEIPT_STATUS.PENDING],
			limit: 200
		};
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
			<DialogTitle>詳細搜尋收款單</DialogTitle>
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
							name="receiptNumber"
							label="收款單號"
							value={params.receiptNumber || ''}
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
					{/* <Grid
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
					</Grid> */}
					<Grid
						item
						xs={12}
						md={6}
					>
						<DatePicker
							label="收款日期 (起)"
							format="yyyy-MM-dd"
							value={params.startDate ? new Date(params.startDate) : null}
							onChange={(date) => handleDateChange('startDate', date)}
							slotProps={{ textField: { fullWidth: true, size: 'small' } }}
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<DatePicker
							label="收款日期 (迄)"
							format="yyyy-MM-dd"
							value={params.endDate ? new Date(params.endDate) : null}
							onChange={(date) => handleDateChange('endDate', date)}
							slotProps={{ textField: { fullWidth: true, size: 'small' } }}
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
								multiple
								value={params.status || []}
								onChange={handleStatusChange}
								label="狀態"
							>
								{Object.entries(RECEIPT_STATUS_NAMES).map(([key, name]) => (
									<MenuItem
										key={key}
										value={Number(key)}
									>
										{name}
									</MenuItem>
								))}
							</Select>
						</FormControl>
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
							<InputLabel id="receipt-type-label">收款方式</InputLabel>
							<Select
								labelId="receipt-type-label"
								id="receiptType"
								multiple
								value={params.receiptType || []}
								onChange={handleTypeChange}
								label="收款方式"
							>
								{Object.entries(RECEIPT_TYPE_NAMES).map(([key, name]) => (
									<MenuItem
										key={key}
										value={Number(key)}
									>
										{name}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<TextField
							name="limit"
							label="顯示數量上限"
							type="number"
							value={params.limit || 200}
							onChange={handleChange}
							fullWidth
							variant="outlined"
							size="small"
						/>
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
