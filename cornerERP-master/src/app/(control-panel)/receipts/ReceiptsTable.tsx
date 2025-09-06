import { useMemo, useState, useEffect } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import { Typography, Button, Paper } from '@mui/material';
import Link from '@fuse/core/Link';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ExcelJS from 'exceljs';
import { useGetReceiptsQuery } from './ReceiptApi';
import { Receipt } from './ReceiptApi';
import { getReceiptTypeName } from 'src/constants/receiptTypes';
import { RECEIPT_STATUS } from '@/constants/receiptStatus';
import ReceiptSearchDialog from './components/ReceiptSearchDialog';
import { format } from 'date-fns';

const STORAGE_KEY = 'receiptSearchParams';

function ReceiptsTable() {
	const [searchDialogOpen, setSearchDialogOpen] = useState(false);
	const [searchParams, setSearchParams] = useState(() => {
		// 從 localStorage 讀取儲存的搜尋參數，如果沒有則使用預設值
		const savedParams = localStorage.getItem(STORAGE_KEY);
		return savedParams
			? JSON.parse(savedParams)
			: {
					status: [RECEIPT_STATUS.PENDING],
					limit: 200
				};
	});

	const { data: receipts, isLoading, isFetching } = useGetReceiptsQuery(searchParams);

	// 當搜尋參數改變時，保存到 localStorage
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(searchParams));
	}, [searchParams]);

	const columns = useMemo<MRT_ColumnDef<Receipt>[]>(
		() => [
			{
				accessorKey: 'receiptNumber',
				header: '收款單號',
				Cell: ({ row }) => (
					<Typography
						component={Link}
						to={`/receipts/${row.original.receiptNumber}`}
					>
						<u>{row.original.receiptNumber}</u>
					</Typography>
				)
			},
			{
				accessorKey: 'groupCode',
				header: '團號',
				Cell: ({ row }) =>
					row.original.groupCode ? (
						<Typography
							component={Link}
							to={`/groups/${row.original.groupCode}`}
						>
							<u>{row.original.groupCode}</u>
						</Typography>
					) : (
						<Typography>-</Typography>
					)
			},
			{
				accessorKey: 'groupName',
				header: '團名',
				Cell: ({ row }) => <Typography>{row.original.groupName || '-'}</Typography>
			},
			{
				accessorKey: 'orderNumber',
				header: '訂單編號',
				Cell: ({ row }) => (
					<Typography
						component={Link}
						to={`/receipts/by-order/${row.original.orderNumber}`}
					>
						<u>{row.original.orderNumber}</u>
					</Typography>
				)
			},
			{
				accessorKey: 'receiptDate',
				header: '收款日期',
				accessorFn: (row) => row.receiptDate
			},
			{
				accessorKey: 'receiptAmount',
				header: '金額',
				accessorFn: (row) => row.receiptAmount.toLocaleString()
			},
			{
				accessorKey: 'receiptType',
				header: '收款方式',
				Cell: ({ row }) => <Typography>{getReceiptTypeName(row.original.receiptType)}</Typography>
			}
		],
		[]
	);

	// 匯出Excel功能
	const handleExportExcel = (data: Receipt[]) => {
		// 準備匯出數據
		const exportData = data.map((item) => ({
			收款單號: item.receiptNumber,
			團號: item.groupCode || '-',
			團名: item.groupName || '-',
			訂單編號: item.orderNumber,
			收款日期: item.receiptDate,
			金額: item.receiptAmount.toLocaleString(),
			收款方式: getReceiptTypeName(item.receiptType)
		}));

		// 創建工作簿
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('收款單列表');

		// 添加標題行
		const headers = ['收款編號', '訂單編號', '收款日期', '收款金額', '收款類型', '狀態', '收款帳戶', '備註'];
		worksheet.addRow(headers);

		// 添加數據行
		exportData.forEach(row => {
			worksheet.addRow([
				row.receiptNumber,
				row.orderNumber, 
				row.receiptDate,
				row.receiptAmount,
				row.receiptType,
				row.status,
				row.receiptAccount,
				row.note
			]);
		});

		// 生成帶有日期的檔名
		const fileName = `${format(new Date(), 'yyyy_MM_dd')}_收款單列表.xlsx`;

		// 匯出Excel文件
		workbook.xlsx.writeBuffer().then((buffer) => {
			const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = fileName;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		});
	};

	if (isLoading || isFetching) {
		return <FuseLoading />;
	}

	return (
		<Paper
			className="flex flex-col flex-auto shadow-1 rounded-t-lg overflow-hidden rounded-b-none w-full h-full"
			elevation={0}
		>
			<DataTable
				tableId="receipts-table"
				data={receipts || []}
				columns={columns}
				enableRowActions={false}
				enableRowSelection={false}
				renderTopToolbarCustomActions={({ table }) => {
					const { rowSelection } = table.getState();

					if (Object.keys(rowSelection).length === 0) {
						return (
							<div className="flex gap-2">
								<Button
									variant="contained"
									size="small"
									onClick={() => setSearchDialogOpen(true)}
									className="flex items-center"
									color="primary"
								>
									<FuseSvgIcon size={16}>heroicons-outline:magnifying-glass</FuseSvgIcon>
									<span className="hidden sm:flex mx-2">詳細搜尋</span>
								</Button>
								<Button
									variant="contained"
									size="small"
									onClick={() => {
										// 獲取經過 DataTable 內部篩選後的數據
										const filteredData = table
											.getFilteredRowModel()
											.rows.map((row) => row.original);
										// 匯出篩選後的數據
										handleExportExcel(filteredData);
									}}
									className="flex items-center"
									color="secondary"
								>
									<FuseSvgIcon size={16}>heroicons-outline:document-arrow-down</FuseSvgIcon>
									<span className="hidden sm:flex mx-2">匯出Excel</span>
								</Button>
							</div>
						);
					}
				}}
			/>
			<ReceiptSearchDialog
				open={searchDialogOpen}
				onClose={() => setSearchDialogOpen(false)}
				onSearch={setSearchParams}
				initialParams={searchParams}
			/>
		</Paper>
	);
}

export default ReceiptsTable;
