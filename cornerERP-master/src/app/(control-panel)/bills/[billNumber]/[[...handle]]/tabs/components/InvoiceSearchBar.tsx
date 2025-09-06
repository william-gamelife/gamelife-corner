import { TextField, Button, Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface InvoiceSearchBarProps {
	onSearchTextChange: (text: string) => void;
	onSearchDateChange: (date: Date | null) => void;
	onClearFilter: () => void;
	searchText: string;
	searchDate: Date | null;
}

export function InvoiceSearchBar({
	onSearchTextChange,
	onSearchDateChange,
	onClearFilter,
	searchText,
	searchDate
}: InvoiceSearchBarProps) {
	const handleSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onSearchTextChange(event.target.value);
	};

	const handleClearSearch = () => {
		onSearchTextChange('');
	};

	const handleShowTodayInvoices = () => {
		onSearchDateChange(new Date());
	};

	return (
		<Box className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
			<TextField
				label="搜尋請款編號或團名"
				variant="outlined"
				size="small"
				value={searchText}
				onChange={handleSearchTextChange}
				sx={{ minWidth: '200px' }}
				InputProps={{
					endAdornment: searchText && (
						<Button
							size="small"
							onClick={handleClearSearch}
							sx={{ minWidth: 'auto' }}
						>
							<FuseSvgIcon>heroicons-solid:x-mark</FuseSvgIcon>
						</Button>
					)
				}}
			/>
			<DatePicker
				label="搜尋出帳日期"
				format="yyyy-MM-dd"
				value={searchDate}
				onChange={onSearchDateChange}
				slotProps={{
					textField: {
						size: 'small',
						fullWidth: true,
						sx: { minWidth: '200px' }
					}
				}}
			/>
			<Button
				variant="contained"
				color="primary"
				onClick={handleShowTodayInvoices}
				size="small"
				sx={{ height: '40px' }}
			>
				當日
			</Button>
			<Button
				variant="outlined"
				color="secondary"
				onClick={onClearFilter}
				size="small"
				sx={{ height: '40px' }}
				disabled={!searchDate}
			>
				清除
			</Button>
		</Box>
	);
}
