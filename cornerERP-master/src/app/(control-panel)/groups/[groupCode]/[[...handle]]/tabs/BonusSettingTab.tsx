import { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import { Typography, Drawer, IconButton, Button, Chip } from '@mui/material';
import { useParams } from 'next/navigation';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import {
	useGetGroupBonusSettingsQuery,
	useDeleteGroupBonusSettingMutation,
	GroupBonusSetting
} from '@/app/(control-panel)/groups/GroupBonusSettingApi';
import BonusSettingForm from './BonusSettingForm';
import { useUserDictionary } from '@/app/(control-panel)/users/hooks/useUserDictionary';
import {
	BONUS_SETTING_TYPE_NAMES,
	BONUS_SETTING_TYPE_COLORS,
	BONUS_CALCULATION_TYPES
} from '@/constants/bonusSettingTypes';

function BonusSettingTab() {
	const routeParams = useParams<{ groupCode: string }>();
	const { groupCode } = routeParams;
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [selectedSetting, setSelectedSetting] = useState<GroupBonusSetting | null>(null);
	const { getUserName } = useUserDictionary();

	const { data: bonusSettings, isLoading } = useGetGroupBonusSettingsQuery(groupCode);
	const [deleteBonusSetting] = useDeleteGroupBonusSettingMutation();

	const handleAddSetting = () => {
		setSelectedSetting(null);
		setDrawerOpen(true);
	};

	const handleEditSetting = (setting: GroupBonusSetting) => {
		setSelectedSetting(setting);
		setDrawerOpen(true);
	};

	const handleDeleteSetting = async (id: number) => {
		if (window.confirm('確定要刪除此獎金設定嗎？')) {
			await deleteBonusSetting(id);
		}
	};

	const handleCloseDrawer = () => {
		setDrawerOpen(false);
	};

	const getTypeLabel = (type: number) => {
		return BONUS_SETTING_TYPE_NAMES[type] || '未知類型';
	};

	const getTypeColor = (type: number) => {
		return BONUS_SETTING_TYPE_COLORS[type] || 'default';
	};

	const columns = useMemo<MRT_ColumnDef<GroupBonusSetting>[]>(
		() => [
			{
				accessorKey: 'type',
				header: '類型',
				Cell: ({ row }) => (
					<Chip
						label={getTypeLabel(row.original.type)}
						color={getTypeColor(row.original.type) as any}
						size="small"
					/>
				)
			},
			{
				accessorKey: 'bonus',
				header: '獎金',
				Cell: ({ row }) => {
					const { bonus, bonusType } = row.original;

					// 判斷是否為負值類型 (2: 負百分比, 3: 負固定金額)
					const isNegative =
						bonusType === BONUS_CALCULATION_TYPES.MINUS_PERCENT ||
						bonusType === BONUS_CALCULATION_TYPES.MINUS_FIXED_AMOUNT;

					// 判斷是否為百分比類型 (0: 百分比, 2: 負百分比)
					const isPercent =
						bonusType === BONUS_CALCULATION_TYPES.PERCENT ||
						bonusType === BONUS_CALCULATION_TYPES.MINUS_PERCENT;

					// 格式化數值
					const formattedValue = bonus.toLocaleString();

					// 根據類型返回不同格式
					if (isPercent) {
						return `${isNegative ? '-' : ''}${formattedValue} %`;
					} else {
						return `${isNegative ? '-' : ''}${formattedValue} 元`;
					}
				}
			},
			{
				accessorKey: 'employeeCode',
				header: '對應員工',
				Cell: ({ row }) => (row.original.employeeCode ? getUserName(row.original.employeeCode) : '-')
			},
			{
				id: 'actions',
				header: '操作',
				Cell: ({ row }) => (
					<div className="flex space-x-2">
						<IconButton
							onClick={() => handleEditSetting(row.original)}
							size="small"
							color="primary"
						>
							<FuseSvgIcon>heroicons-outline:pencil</FuseSvgIcon>
						</IconButton>
						<IconButton
							onClick={() => handleDeleteSetting(row.original.id as number)}
							size="small"
							color="error"
						>
							<FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon>
						</IconButton>
					</div>
				)
			}
		],
		[]
	);

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<>
			<div className="flex justify-end mb-4">
				<Button
					variant="contained"
					color="secondary"
					onClick={handleAddSetting}
					startIcon={<FuseSvgIcon>heroicons-outline:plus</FuseSvgIcon>}
				>
					新增獎金設定
				</Button>
			</div>

			<DataTable
				tableId="bonus-setting-table"
				data={bonusSettings || []}
				columns={columns}
				enableRowActions={false}
				enableRowSelection={false}
			/>

			<Drawer
				anchor="right"
				open={drawerOpen}
				onClose={handleCloseDrawer}
				PaperProps={{
					sx: { width: { xs: '100%', sm: 480 } }
				}}
			>
				<div className="p-6">
					<div className="flex items-center justify-between mb-6">
						<Typography variant="h6">{selectedSetting ? '編輯獎金設定' : '新增獎金設定'}</Typography>
						<IconButton
							onClick={handleCloseDrawer}
							size="large"
						>
							<FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
						</IconButton>
					</div>

					<BonusSettingForm
						setting={selectedSetting}
						groupCode={groupCode}
						onClose={handleCloseDrawer}
					/>
				</div>
			</Drawer>
		</>
	);
}

export default BonusSettingTab;
