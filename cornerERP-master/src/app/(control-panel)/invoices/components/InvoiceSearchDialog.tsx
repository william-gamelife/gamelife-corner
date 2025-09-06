import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState, useEffect } from 'react';
import { INVOICE_STATUS_OPTIONS } from '@/constants/invoiceStatus';
import { format } from 'date-fns';
interface SearchParams {
	invoiceNumber?: string;
	groupCode?: string;
	orderNumber?: string;
	dateFrom?: string | null;
	dateTo?: string | null;
	status?: number[];
	limit?: number;
}

interface InvoiceSearchDialogProps {
	open: boolean;
	onClose: () => void;
	onSearch: (params: SearchParams) => void;
	initialParams?: SearchParams;
}

function InvoiceSearchDialog({ open, onClose, onSearch, initialParams }: InvoiceSearchDialogProps) {
	const [searchParams, setSearchParams] = useState<SearchParams>(
		initialParams || {
			invoiceNumber: '',
			groupCode: '',
			orderNumber: '',
			dateFrom: null,
			dateTo: null,
			status: [],
			limit: 200
		}
	);

	useEffect(() => {
		if (initialParams) {
			setSearchParams(initialParams);
		}
	}, [initialParams]);

	const handleSearch = () => {
		onSearch({
			...searchParams,
			dateFrom: searchParams.dateFrom ? format(searchParams.dateFrom, 'yyyy-MM-dd') : '',
			dateTo: searchParams.dateTo ? format(searchParams.dateTo, 'yyyy-MM-dd') : ''
		});
		onClose();
	};

	const handleReset = () => {
		const defaultParams: SearchParams = {
			invoiceNumber: '',
			groupCode: '',
			orderNumber: '',
			dateFrom: null,
			dateTo: null,
			status: [],
			limit: 200
		};
		setSearchParams(defaultParams);
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
			<DialogTitle>詳細搜尋</DialogTitle>
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
							fullWidth
							label="請款單號"
							value={searchParams.invoiceNumber || ''}
							onChange={(e) => setSearchParams({ ...searchParams, invoiceNumber: e.target.value })}
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<TextField
							fullWidth
							label="團號"
							value={searchParams.groupCode || ''}
							onChange={(e) => setSearchParams({ ...searchParams, groupCode: e.target.value })}
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<TextField
							fullWidth
							label="訂單編號"
							value={searchParams.orderNumber || ''}
							onChange={(e) => setSearchParams({ ...searchParams, orderNumber: e.target.value })}
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<DatePicker
							label="請款日期從"
							format="yyyy-MM-dd"
							value={searchParams.dateFrom ? new Date(searchParams.dateFrom) : null}
							onChange={(date) =>
								setSearchParams({ ...searchParams, dateFrom: date ? format(date, 'yyyy-MM-dd') : '' })
							}
							slotProps={{
								textField: { fullWidth: true }
							}}
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<DatePicker
							label="請款日期至"
							format="yyyy-MM-dd"
							value={searchParams.dateTo ? new Date(searchParams.dateTo) : null}
							onChange={(date) =>
								setSearchParams({ ...searchParams, dateTo: date ? format(date, 'yyyy-MM-dd') : '' })
							}
							slotProps={{
								textField: { fullWidth: true }
							}}
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<FormControl fullWidth>
							<InputLabel>狀態</InputLabel>
							<Select
								multiple
								value={searchParams.status || []}
								onChange={(e) =>
									setSearchParams({ ...searchParams, status: e.target.value as number[] })
								}
								label="狀態"
							>
								{INVOICE_STATUS_OPTIONS.map((option) => (
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
					<Grid
						item
						xs={12}
						md={6}
					>
						<TextField
							fullWidth
							type="number"
							label="顯示筆數"
							value={searchParams.limit || 200}
							onChange={(e) =>
								setSearchParams({
									...searchParams,
									limit: parseInt(e.target.value) || 200
								})
							}
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
					onClick={handleSearch}
					variant="contained"
				>
					搜尋
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default InvoiceSearchDialog;
