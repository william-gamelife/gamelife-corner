import { useMemo, useState, useEffect } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import { Typography, Button, Paper } from '@mui/material';
import Link from '@fuse/core/Link';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useGetSuppliersQuery } from './SupplierApi';
import { Supplier } from './SupplierApi';
import SupplierSearchDialog from './components/SupplierSearchDialog';
import { SUPPLIER_TYPES_NAMES } from '@/constants/supplierTypes';
const STORAGE_KEY = 'supplierSearchParams';

function SuppliersTable() {
	const [searchDialogOpen, setSearchDialogOpen] = useState(false);
	const [searchParams, setSearchParams] = useState(() => {
		// 從 localStorage 讀取儲存的搜尋參數，如果沒有則使用預設值
		const savedParams = localStorage.getItem(STORAGE_KEY);
		return savedParams
			? JSON.parse(savedParams)
			: {
					limit: 200
				};
	});

	const { data: suppliers, isLoading, isFetching } = useGetSuppliersQuery(searchParams);

	// 當搜尋參數改變時，保存到 localStorage
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(searchParams));
	}, [searchParams]);

	const columns = useMemo<MRT_ColumnDef<Supplier>[]>(
		() => [
			{
				accessorKey: 'supplierCode',
				header: '供應商編號',
				Cell: ({ row }) => (
					<Typography
						component={Link}
						to={`/suppliers/${row.original.supplierCode}`}
					>
						<u>{row.original.supplierCode}</u>
					</Typography>
				)
			},
			{
				accessorKey: 'supplierType',
				header: '供應商類型',
				Cell: ({ row }) => <Typography>{SUPPLIER_TYPES_NAMES[row.original.supplierType] || '-'}</Typography>
			},
			{
				accessorKey: 'supplierName',
				header: '供應商名稱'
			},
			{
				accessorKey: 'accountCode',
				header: '銀行號碼',
				Cell: ({ row }) => <Typography>{row.original.accountCode || '-'}</Typography>
			},
			{
				accessorKey: 'accountName',
				header: '帳戶名稱',
				Cell: ({ row }) => <Typography>{row.original.accountName || '-'}</Typography>
			}
		],
		[]
	);

	if (isLoading || isFetching) {
		return <FuseLoading />;
	}

	return (
		<Paper
			className="flex flex-col flex-auto shadow-1 rounded-t-lg overflow-hidden rounded-b-none w-full h-full"
			elevation={0}
		>
			<DataTable
				tableId="suppliers-table"
				data={suppliers}
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
							</div>
						);
					}
				}}
			/>
			<SupplierSearchDialog
				open={searchDialogOpen}
				onClose={() => setSearchDialogOpen(false)}
				onSearch={setSearchParams}
				initialParams={searchParams}
			/>
		</Paper>
	);
}

export default SuppliersTable;
