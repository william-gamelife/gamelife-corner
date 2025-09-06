'use client';

import { useState, useEffect } from 'react';
import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
	Typography,
	Chip,
	Button
} from '@mui/material';
import { useRouter } from 'next/navigation';
import FuseLoading from '@fuse/core/FuseLoading';
import Link from 'next/link';
import { GROUP_STATUS_NAMES, GROUP_STATUS_COLORS } from '@/constants/groupStatuses';
import { format } from 'date-fns';

interface GroupHistoryTabProps {
	customerId: string;
}

interface GroupHistory {
	groupCode: string;
	groupName: string;
	departureDate: string;
	returnDate: string;
	status: number;
	createdAt: string;
}

function GroupHistoryTab({ customerId }: GroupHistoryTabProps) {
	const router = useRouter();
	const [groups, setGroups] = useState<GroupHistory[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	useEffect(() => {
		fetchCustomerGroups();
	}, [customerId]);

	const fetchCustomerGroups = async () => {
		try {
			const response = await fetch(`/api/supabase/customers/${customerId}/groups`);

			if (response.ok) {
				const data = await response.json();
				setGroups(data.groups || []);
			}
		} catch (error) {
			console.error('Failed to fetch customer groups:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const getStatusColor = (status: number): any => {
		return GROUP_STATUS_COLORS[status] || 'default';
	};

	const getStatusLabel = (status: number) => {
		return GROUP_STATUS_NAMES[status] || '未知';
	};

	if (loading) {
		return <FuseLoading />;
	}

	if (groups.length === 0) {
		return (
			<Paper className="p-24 text-center">
				<Typography
					variant="h6"
					color="text.secondary"
				>
					尚無參團記錄
				</Typography>
			</Paper>
		);
	}

	// 分頁資料
	const displayedGroups = groups.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

	return (
		<Paper className="w-full">
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>團號</TableCell>
							<TableCell>團名</TableCell>
							<TableCell>出發日期</TableCell>
							<TableCell>回程日期</TableCell>
							<TableCell>狀態</TableCell>
							<TableCell>建立時間</TableCell>
							<TableCell align="center">操作</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{displayedGroups.map((group) => (
							<TableRow
								key={group.groupCode}
								hover
							>
								<TableCell>
									<Link
										href={`/groups/${group.groupCode}`}
										className="text-blue-500 hover:underline"
									>
										{group.groupCode}
									</Link>
								</TableCell>
								<TableCell>{group.groupName}</TableCell>
								<TableCell>{format(new Date(group.departureDate), 'yyyy-MM-dd')}</TableCell>
								<TableCell>{format(new Date(group.returnDate), 'yyyy-MM-dd')}</TableCell>
								<TableCell>
									<Chip
										label={getStatusLabel(group.status)}
										color={getStatusColor(group.status) as any}
										size="small"
									/>
								</TableCell>
								<TableCell>{format(new Date(group.createdAt), 'yyyy-MM-dd')}</TableCell>
								<TableCell align="center">
									<Button
										size="small"
										variant="outlined"
										onClick={() => router.push(`/groups/${group.groupCode}`)}
									>
										查看
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<TablePagination
				component="div"
				count={groups.length}
				rowsPerPage={rowsPerPage}
				page={page}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				labelRowsPerPage="每頁顯示"
				labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
				rowsPerPageOptions={[5, 10, 25, 50]}
			/>
		</Paper>
	);
}

export default GroupHistoryTab;
