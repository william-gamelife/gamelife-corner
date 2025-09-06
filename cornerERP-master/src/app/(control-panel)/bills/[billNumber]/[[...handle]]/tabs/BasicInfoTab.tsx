import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField, Checkbox, TableCell, TableRow, Typography, Box } from '@mui/material';
import { BILL_STATUS_OPTIONS } from 'src/constants/billStatuses';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { INVOICE_STATUS } from 'src/constants/invoiceStatus';
import { useEffect, useState } from 'react';
import { useUserDictionary } from '@/app/(control-panel)/users/hooks/useUserDictionary';
import { useInvoiceData } from '../InvoiceContext';
import { format } from 'date-fns';
import FuseLoading from '@fuse/core/FuseLoading';
import { Invoice } from '@/app/(control-panel)/invoices/InvoiceApi';
import { InvoiceSearchBar } from './components/InvoiceSearchBar';
import { InvoiceTable } from './components/InvoiceTable';
import { InvoiceDialog } from './components/InvoiceDialog';

interface BasicInfoTabProps {
	isReadOnly?: boolean;
}

function BasicInfoTab({ isReadOnly = false }: BasicInfoTabProps) {
	const { getUserName } = useUserDictionary();
	const methods = useFormContext();
	const { control, formState, setValue } = methods;
	const { errors } = formState;

	// 從Context獲取發票數據
	const { invoices: filteredInvoices = [], isLoading: isInvoicesLoading, refetch } = useInvoiceData();

	// 當前選中的發票編號
	const selectedInvoiceNumbers = useWatch({
		control,
		name: 'invoiceNumbers',
		defaultValue: []
	});

	// 保存原始選中的發票編號，用於比較變更
	const [originalInvoiceNumbers, setOriginalInvoiceNumbers] = useState<string[]>([]);

	// 搜尋日期狀態
	const [searchDate, setSearchDate] = useState<Date | null>(null);
	// 搜尋文字狀態
	const [searchText, setSearchText] = useState('');

	// 初始化原始選中的發票編號
	useEffect(() => {
		if (selectedInvoiceNumbers.length > 0 && originalInvoiceNumbers.length === 0) {
			setOriginalInvoiceNumbers([...selectedInvoiceNumbers]);
		}
	}, [selectedInvoiceNumbers, originalInvoiceNumbers]);

	// 處理發票選擇變更
	const handleInvoiceSelectionChange = (invoiceNumber: string, isSelected: boolean) => {
		const currentSelected = [...selectedInvoiceNumbers];

		if (isSelected) {
			// 添加到選中列表
			if (!currentSelected.includes(invoiceNumber)) {
				currentSelected.push(invoiceNumber);
			}
		} else {
			// 從選中列表移除
			const index = currentSelected.indexOf(invoiceNumber);

			if (index !== -1) {
				currentSelected.splice(index, 1);
			}
		}

		// 使用 setValue 更新選中的發票編號
		setValue('invoiceNumbers', currentSelected, {
			shouldDirty: true,
			shouldTouch: true,
			shouldValidate: true
		});
	};

	// 處理日期搜尋變更
	const handleSearchDateChange = (date: Date | null) => {
		setSearchDate(date);
	};

	// 顯示當日請款單
	const handleShowTodayInvoices = () => {
		setSearchDate(new Date());
	};

	// 清除日期篩選
	const handleClearFilter = () => {
		setSearchDate(null);
	};

	// 處理搜尋文字變更
	const handleSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchText(event.target.value);
	};

	// 清除搜尋
	const handleClearSearch = () => {
		setSearchText('');
	};

	// 在表格中顯示發票
	const renderInvoices = () => {
		// 根據搜尋日期過濾發票
		let filteredByDate = searchDate
			? filteredInvoices.filter((invoice) => {
					const invoiceDate =
						invoice.invoiceDate instanceof Date ? invoice.invoiceDate : new Date(invoice.invoiceDate);

					return format(invoiceDate, 'yyyy-MM-dd') === format(searchDate, 'yyyy-MM-dd');
				})
			: filteredInvoices;

		// 根據搜尋文字過濾發票
		if (searchText) {
			const searchLower = searchText.toLowerCase();
			filteredByDate = filteredByDate.filter(
				(invoice) =>
					invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
					(invoice.groupName || '').toLowerCase().includes(searchLower)
			);
		}

		if (filteredByDate.length === 0) {
			return (
				<TableRow>
					<TableCell
						colSpan={7}
						align="center"
					>
						{searchDate ? `沒有${format(searchDate, 'yyyy-MM-dd')}的請款單` : '沒有可用的請款單'}
					</TableCell>
				</TableRow>
			);
		}

		return filteredByDate.map((invoice) => {
			const isSelected = selectedInvoiceNumbers.includes(invoice.invoiceNumber);
			const isDisabled = false;

			// 計算總金額
			const totalAmount = invoice.invoiceItems
				? invoice.invoiceItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
				: 0;

			// 安全地獲取團名
			const groupName = invoice.groupName || '';

			// 格式化日期
			const formattedDate =
				invoice.invoiceDate instanceof Date
					? format(invoice.invoiceDate, 'yyyy-MM-dd')
					: typeof invoice.invoiceDate === 'string'
						? invoice.invoiceDate
						: '';

			return (
				<TableRow
					key={invoice.invoiceNumber}
					hover
					selected={isSelected}
					style={{ opacity: isDisabled ? 0.5 : 1 }}
				>
					<TableCell padding="checkbox">
						<Checkbox
							checked={isSelected}
							disabled={isDisabled || isReadOnly}
							onChange={(e) => handleInvoiceSelectionChange(invoice.invoiceNumber, e.target.checked)}
						/>
					</TableCell>
					<TableCell
						onClick={() => handleInvoiceClick(invoice)}
						sx={{ cursor: 'pointer', color: 'primary.main', textDecoration: 'underline' }}
					>
						{invoice.invoiceNumber}
					</TableCell>
					<TableCell>{groupName}</TableCell>
					<TableCell>{formattedDate}</TableCell>
					<TableCell>{getUserName(invoice.createdBy)}</TableCell>
					<TableCell>{totalAmount.toLocaleString()}</TableCell>
					<TableCell>
						{invoice.status === INVOICE_STATUS.PENDING && '待確認'}
						{invoice.status === INVOICE_STATUS.CONFIRMED && '已確認'}
						{invoice.status === INVOICE_STATUS.BILLED && '已出帳'}
					</TableCell>
				</TableRow>
			);
		});
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			// 全選時，選擇所有可見的發票
			const visibleInvoiceNumbers = filteredInvoices
				.filter((invoice) => {
					// 日期篩選
					if (searchDate) {
						const invoiceDate =
							invoice.invoiceDate instanceof Date ? invoice.invoiceDate : new Date(invoice.invoiceDate);

						if (format(invoiceDate, 'yyyy-MM-dd') !== format(searchDate, 'yyyy-MM-dd')) {
							return false;
						}
					}

					// 文字搜尋
					if (searchText) {
						const searchLower = searchText.toLowerCase();

						if (
							!invoice.invoiceNumber.toLowerCase().includes(searchLower) &&
							!(invoice.groupName || '').toLowerCase().includes(searchLower)
						) {
							return false;
						}
					}

					return true;
				})
				.map((invoice) => invoice.invoiceNumber);

			setValue('invoiceNumbers', visibleInvoiceNumbers, {
				shouldDirty: true,
				shouldTouch: true,
				shouldValidate: true
			});
		} else {
			// 全不選
			setValue('invoiceNumbers', [], {
				shouldDirty: true,
				shouldTouch: true,
				shouldValidate: true
			});
		}
	};

	// 檢查是否所有可見的發票都被選中
	const isAllSelected = () => {
		const visibleInvoiceNumbers = filteredInvoices
			.filter((invoice) => {
				// 日期篩選
				if (searchDate) {
					const invoiceDate =
						invoice.invoiceDate instanceof Date ? invoice.invoiceDate : new Date(invoice.invoiceDate);

					if (format(invoiceDate, 'yyyy-MM-dd') !== format(searchDate, 'yyyy-MM-dd')) {
						return false;
					}
				}

				// 文字搜尋
				if (searchText) {
					const searchLower = searchText.toLowerCase();

					if (
						!invoice.invoiceNumber.toLowerCase().includes(searchLower) &&
						!(invoice.groupName || '').toLowerCase().includes(searchLower)
					) {
						return false;
					}
				}

				return true;
			})
			.map((invoice) => invoice.invoiceNumber);

		return (
			visibleInvoiceNumbers.length > 0 &&
			visibleInvoiceNumbers.every((number) => selectedInvoiceNumbers.includes(number))
		);
	};

	const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState<string | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	// 處理發票點選
	const handleInvoiceClick = (invoice: Invoice) => {
		setSelectedInvoiceNumber(invoice.invoiceNumber);
		setIsDialogOpen(true);
	};

	// 關閉 Dialog
	const handleCloseDialog = () => {
		setIsDialogOpen(false);
		setSelectedInvoiceNumber(null);
	};

	// 從最新資料中找出選中的發票
	const selectedInvoice = selectedInvoiceNumber
		? filteredInvoices.find((inv) => inv.invoiceNumber === selectedInvoiceNumber)
		: null;

	const filteredInvoicesBySearch = filteredInvoices.filter((invoice) => {
		if (searchDate) {
			const invoiceDate =
				invoice.invoiceDate instanceof Date ? invoice.invoiceDate : new Date(invoice.invoiceDate);

			if (format(invoiceDate, 'yyyy-MM-dd') !== format(searchDate, 'yyyy-MM-dd')) {
				return false;
			}
		}

		if (searchText) {
			const searchLower = searchText.toLowerCase();

			if (
				!invoice.invoiceNumber.toLowerCase().includes(searchLower) &&
				!(invoice.groupName || '').toLowerCase().includes(searchLower)
			) {
				return false;
			}
		}

		return true;
	});

	return (
		<div className="grid grid-cols-1 gap-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Controller
					name="billDate"
					control={control}
					render={({ field }) => (
						<DatePicker
							{...field}
							label="出帳日期"
							format="yyyy-MM-dd"
							value={field.value ? new Date(field.value) : null}
							slotProps={{
								textField: {
									fullWidth: true,
									required: true,
									error: !!errors.billDate,
									helperText: errors?.billDate?.message as string,
									disabled: isReadOnly
								}
							}}
						/>
					)}
				/>

				<Controller
					name="billNumber"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="出納單號"
							autoFocus
							variant="outlined"
							fullWidth
							disabled
						/>
					)}
				/>

				<Controller
					name="status"
					control={control}
					render={({ field }) => (
						<FormControl
							fullWidth
							error={!!errors.status}
						>
							<InputLabel>狀態</InputLabel>
							<Select
								{...field}
								label="狀態"
								required
								disabled={isReadOnly}
							>
								{BILL_STATUS_OPTIONS.map((option) => (
									<MenuItem
										key={option.value}
										value={option.value}
									>
										{option.label}
									</MenuItem>
								))}
							</Select>
							{errors.status && (
								<FormHelperText>
									{typeof errors.status.message === 'string' ? errors.status.message : '狀態錯誤'}
								</FormHelperText>
							)}
						</FormControl>
					)}
				/>
			</div>

			<div className="mt-4">
				<Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
					<Typography
						variant="h6"
						gutterBottom
						className="mb-2 sm:mb-0"
					>
						請款編號列表
					</Typography>

					<InvoiceSearchBar
						onSearchTextChange={setSearchText}
						onSearchDateChange={setSearchDate}
						onClearFilter={() => setSearchDate(null)}
						searchText={searchText}
						searchDate={searchDate}
					/>
				</Box>

				{errors.invoiceNumbers && (
					<Typography
						color="error"
						variant="body2"
						className="mb-2"
					>
						{errors.invoiceNumbers?.message as string}
					</Typography>
				)}
				{isInvoicesLoading && <FuseLoading />}
				{!isInvoicesLoading && (
					<InvoiceTable
						invoices={filteredInvoicesBySearch}
						selectedInvoiceNumbers={selectedInvoiceNumbers}
						onInvoiceSelectionChange={handleInvoiceSelectionChange}
						onInvoiceClick={handleInvoiceClick}
						isAllSelected={isAllSelected()}
						onSelectAll={handleSelectAll}
						isReadOnly={isReadOnly}
						getUserName={getUserName}
					/>
				)}
			</div>

			<InvoiceDialog
				isOpen={isDialogOpen}
				onClose={handleCloseDialog}
				selectedInvoice={selectedInvoice}
				onDataRefresh={refetch}
			/>
		</div>
	);
}

export default BasicInfoTab;
