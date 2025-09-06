import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
interface SearchParams {
	orderNumber?: string;
	groupCode?: string;
	contactPerson?: string;
	orderType?: string;
	salesPerson?: string;
	dateFrom?: string | null;
	dateTo?: string | null;
	limit: number;
}

interface OrderSearchDialogProps {
	open: boolean;
	onClose: () => void;
	onSearch: (params: SearchParams) => void;
	initialParams?: SearchParams;
}

function OrderSearchDialog({ open, onClose, onSearch, initialParams }: OrderSearchDialogProps) {
	const [searchParams, setSearchParams] = useState<SearchParams>(
		initialParams || {
			orderNumber: '',
			groupCode: '',
			contactPerson: '',
			orderType: '',
			salesPerson: '',
			dateFrom: '',
			dateTo: '',
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
		const defaultParams = {
			orderNumber: '',
			groupCode: '',
			contactPerson: '',
			orderType: '',
			salesPerson: '',
			dateFrom: '',
			dateTo: '',
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
						<TextField
							fullWidth
							label="聯絡人"
							value={searchParams.contactPerson || ''}
							onChange={(e) => setSearchParams({ ...searchParams, contactPerson: e.target.value })}
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<TextField
							fullWidth
							label="業務員"
							value={searchParams.salesPerson || ''}
							onChange={(e) => setSearchParams({ ...searchParams, salesPerson: e.target.value })}
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<DatePicker
							label="日期從"
							value={searchParams.dateFrom ? new Date(searchParams.dateFrom) : null}
							format="yyyy-MM-dd"
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
							label="日期至"
							value={searchParams.dateTo ? new Date(searchParams.dateTo) : null}
							format="yyyy-MM-dd"
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
				<Button onClick={handleReset}>重設</Button>
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

export default OrderSearchDialog;
