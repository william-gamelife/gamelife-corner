import { useMemo, useState, useEffect } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import { Typography, Button, Paper, Chip } from '@mui/material';
import Link from '@fuse/core/Link';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useGetEsimsQuery } from './EsimApi';
import { Esim } from './EsimApi';
import { useGetGroupsQuery } from '../groups/GroupApi';
import EsimSearchDialog from './components/EsimSearchDialog';
import { ESIM_STATUS_COLORS, getEsimStatusName } from '@/constants/esimStatuses';

const STORAGE_KEY = 'esimSearchParams';

function EsimsTable() {
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

	const { data: esims, isLoading, isFetching } = useGetEsimsQuery(searchParams);
	const { data: groups } = useGetGroupsQuery();

	// 根據 groupCode 找到對應的團名
	const getGroupName = (groupCode: string) => {
		const group = groups?.find((g) => g.groupCode === groupCode);
		return group?.groupName || '-';
	};

	// 當搜尋參數改變時，保存到 localStorage
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(searchParams));
	}, [searchParams]);

	const columns = useMemo<MRT_ColumnDef<Esim>[]>(
		() => [
			{
				accessorKey: 'esimNumber',
				header: '網卡單號',
				Cell: ({ row }) => (
					<Typography
						component={Link}
						to={`/esims/${row.original.esimNumber}`}
					>
						<u>{row.original.esimNumber}</u>
					</Typography>
				)
			},
			{
				accessorKey: 'groupCode',
				header: '團號'
			},
			{
				accessorKey: 'groupName',
				header: '團名',
				Cell: ({ row }) => <Typography>{getGroupName(row.original.groupCode)}</Typography>
			},
			{
				accessorKey: 'orderNumber',
				header: '訂單編號',
				Cell: ({ row }) => <Typography>{row.original.orderNumber || '-'}</Typography>
			},
			{
				accessorKey: 'supplierOrderNumber',
				header: '供應商訂單編號',
				Cell: ({ row }) => <Typography>{row.original.supplierOrderNumber || '-'}</Typography>
			},
			{
				accessorKey: 'productId',
				header: '商品Id',
				Cell: ({ row }) => <Typography>{row.original.productId || '-'}</Typography>
			},
			{
				accessorKey: 'quantity',
				header: '數量',
				Cell: ({ row }) => <Typography>{row.original.quantity} 張</Typography>
			},
			{
				accessorKey: 'email',
				header: '信箱',
				Cell: ({ row }) => <Typography>{row.original.email || '-'}</Typography>
			},
			{
				accessorKey: 'status',
				header: '狀態',
				Cell: ({ row }) => {
					const status = row.original.status;
					return (
						<Chip
							label={getEsimStatusName(status)}
							color={ESIM_STATUS_COLORS[status]}
							size="small"
						/>
					);
				}
			}
		],
		[groups, getGroupName]
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
				tableId="esims-table"
				data={esims}
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
			<EsimSearchDialog
				open={searchDialogOpen}
				onClose={() => setSearchDialogOpen(false)}
				onSearch={setSearchParams}
				initialParams={searchParams}
			/>
		</Paper>
	);
}

export default EsimsTable;
