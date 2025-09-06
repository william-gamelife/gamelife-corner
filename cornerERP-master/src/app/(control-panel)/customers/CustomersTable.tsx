import { useMemo, useState, useEffect } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import { Paper } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Link from '@fuse/core/Link';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useGetCustomersQuery } from './CustomerApi';
import { Customer } from './CustomerApi';
import CustomerSearchDialog from './components/CustomerSearchDialog';
import { format } from 'date-fns';

const STORAGE_KEY = 'customerSearchParams';

function CustomersTable() {
	const [searchDialogOpen, setSearchDialogOpen] = useState(false);
	const [searchParams, setSearchParams] = useState(() => {
		// 從 localStorage 讀取儲存的搜尋參數，如果沒有則使用預設值
		const savedParams = localStorage.getItem(STORAGE_KEY);
		return savedParams ? JSON.parse(savedParams) : {};
	});

	const { data: customers, isLoading, isFetching } = useGetCustomersQuery(searchParams);

	// 當搜尋參數改變時，保存到 localStorage
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(searchParams));
	}, [searchParams]);

	const columns = useMemo<MRT_ColumnDef<Customer>[]>(
		() => [
			{
				accessorKey: 'name',
				header: '姓名'
			},
			{
				accessorKey: 'id',
				header: '身份證號',
				Cell: ({ row }) => (
					<Typography
						component={Link}
						to={`/customers/${row.original.id}`}
					>
						<u>{row.original.id}</u>
					</Typography>
				)
			},
			{
				accessorKey: 'birthday',
				header: '生日',
				Cell: ({ row }) => {
					const birthday = row.original.birthday;
					return birthday ? format(new Date(birthday), 'yyyy-MM-dd') : '-';
				}
			},
			{
				accessorKey: 'passportRomanization',
				header: '護照拼音',
				Cell: ({ row }) => row.original.passportRomanization || '-'
			},
			{
				accessorKey: 'passportNumber',
				header: '護照號碼',
				Cell: ({ row }) => row.original.passportNumber || '-'
			},
			{
				accessorKey: 'passportValidTo',
				header: '護照效期',
				Cell: ({ row }) => {
					const validTo = row.original.passportValidTo;
					return validTo ? format(new Date(validTo), 'yyyy-MM-dd') : '-';
				}
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
				tableId="customers-table"
				data={customers ?? []}
				columns={columns}
				enableRowActions={false}
				enableRowSelection={false}
				renderTopToolbarCustomActions={() => (
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
						{Object.keys(searchParams).length > 0 && (
							<Button
								variant="outlined"
								size="small"
								onClick={() => setSearchParams({})}
								className="flex items-center"
							>
								<FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
								<span className="hidden sm:flex mx-2">清除條件</span>
							</Button>
						)}
					</div>
				)}
			/>
			<CustomerSearchDialog
				open={searchDialogOpen}
				onClose={() => setSearchDialogOpen(false)}
				onConfirm={setSearchParams}
				initialValues={searchParams}
			/>
		</Paper>
	);
}

export default CustomersTable;
