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
import { GROUP_STATUS_OPTIONS } from '@/constants/groupStatuses';
import { formatDateRangeForAPI } from '@/utils/timezone';

interface SearchParams {
	groupCode?: string;
	groupName?: string;
	dateFrom?: Date | null;
	dateTo?: Date | null;
	status?: number[];
	limit?: number;
}

interface SerializedSearchParams {
	groupCode?: string;
	groupName?: string;
	dateFrom?: string;
	dateTo?: string;
	status?: number[];
	limit?: number;
}

interface GroupSearchDialogProps {
	open: boolean;
	onClose: () => void;
	onSearch: (params: SerializedSearchParams) => void;
	initialParams?: SerializedSearchParams;
}

function GroupSearchDialog({ open, onClose, onSearch, initialParams }: GroupSearchDialogProps) {
	const [searchParams, setSearchParams] = useState<SearchParams>({
		groupCode: '',
		groupName: '',
		dateFrom: null,
		dateTo: null,
		status: [],
		limit: 200
	});

	useEffect(() => {
		if (initialParams) {
			console.log(initialParams);
			// 轉換序列化的參數為本地狀態（字串轉 Date）
			const convertedParams: SearchParams = {
				...initialParams,
				dateFrom: initialParams.dateFrom ? new Date(initialParams.dateFrom) : null,
				dateTo: initialParams.dateTo ? new Date(initialParams.dateTo) : null
			};
			setSearchParams(convertedParams);
		}
	}, [initialParams]);

	const handleSearch = () => {
		// 使用台北時區格式化日期，避免時區偏差問題
		const { dateFrom, dateTo } = formatDateRangeForAPI(searchParams.dateFrom, searchParams.dateTo);
		const serializedParams = {
			...searchParams,
			dateFrom,
			dateTo
		};
		onSearch(serializedParams);
		onClose();
	};

	const handleReset = () => {
		const defaultParams: SearchParams = {
			groupCode: '',
			groupName: '',
			dateFrom: null,
			dateTo: null,
			status: [],
			limit: 200
		};
		setSearchParams(defaultParams);
		// 將重設參數也序列化
		const serializedDefaultParams = {
			...defaultParams,
			dateFrom: undefined,
			dateTo: undefined
		};
		onSearch(serializedDefaultParams);
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
							label="團名"
							value={searchParams.groupName || ''}
							onChange={(e) => setSearchParams({ ...searchParams, groupName: e.target.value })}
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<DatePicker
							label="日期從"
							format="yyyy-MM-dd"
							value={searchParams.dateFrom}
							onChange={(date) => setSearchParams({ ...searchParams, dateFrom: date })}
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
							format="yyyy-MM-dd"
							value={searchParams.dateTo}
							onChange={(date) => setSearchParams({ ...searchParams, dateTo: date })}
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
								{GROUP_STATUS_OPTIONS.map((option) => (
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

export default GroupSearchDialog;
