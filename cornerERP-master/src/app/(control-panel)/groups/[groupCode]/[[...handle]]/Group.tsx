'use client';

import FuseLoading from '@fuse/core/FuseLoading';
import FusePageCarded from '@fuse/core/FusePageCarded';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { SyntheticEvent, useEffect, useState, Suspense, lazy, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from '@fuse/core/Link';
import _ from 'lodash';
import { FormProvider, useForm } from 'react-hook-form';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FuseTabs from 'src/components/tabs/FuseTabs';
import FuseTab from 'src/components/tabs/FuseTab';
import GroupHeader from './GroupHeader';
import GroupModel from '../../models/GroupModel';
import { useGetGroupQuery } from '../../GroupApi';

// 動態導入各標籤頁面
const BasicInfoTab = lazy(() => import('./tabs/BasicInfoTab'));
const OrdersTab = lazy(() => import('./tabs/OrdersTab'));
const TravellersTab = lazy(() => import('./tabs/TravellersTab'));
const BonusSettingTab = lazy(() => import('./tabs/BonusSettingTab'));
const GroupReportTab = lazy(() => import('./tabs/GroupReportTab'));
const ProfitTab = lazy(() => import('./tabs/ProfitTab'));
import { GROUP_STATUSES, GroupStatus } from '@/constants/groupStatuses';
import useUser from '@auth/useUser';
import FuseUtils from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';
/**
 * Form Validation Schema
 */
const baseSchema = z.object({
	groupName: z.string().min(1, '團名不能為空').max(65, '團名不能超過65字'),
	departureDate: z.union([z.string(), z.date()]),
	returnDate: z.union([z.string(), z.date()]),
	status: z
		.number()
		.refine(
			(val) =>
				[GROUP_STATUSES.IN_PROGRESS, GROUP_STATUSES.COMPLETED, GROUP_STATUSES.SPECIAL].includes(
					val as GroupStatus
				),
			{
				message: '團狀態必須是有效值'
			}
		)
});

// 新增模式的 schema，包含訂單欄位
const createSchema = baseSchema.extend({
	order: z
		.object({
			contactPerson: z.string().min(1, '聯絡人不能為空'),
			contactPhone: z.string().min(1, '聯絡電話不能為空'),
			salesPerson: z.string().min(1, '業務員不能為空'),
			opId: z.string().min(1, 'OP員不能為空')
		})
		.optional() // 訂單資訊為可選
});

// 編輯模式使用基本 schema
const editSchema = baseSchema;

/**
 * The group page.
 */
function Group() {
	const { data: user } = useUser();
	// 確保 userRole 是陣列格式
	const userRole = user?.roles ? (Array.isArray(user.roles) ? user.roles : [user.roles]) : [];
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	const routeParams = useParams<{ groupCode: string }>();
	const searchParams = useSearchParams();

	const { groupCode } = routeParams;

	// 判斷是否為新增模式
	const isNewGroup = groupCode === 'new';

	// 從 URL 參數獲取預設的出發日期
	const defaultDepartureDate = searchParams.get('departureDate');

	const {
		data: group,
		isLoading,
		isError
	} = useGetGroupQuery(groupCode, {
		skip: !groupCode || isNewGroup
	});

	const [tabValue, setTabValue] = useState('basic-info');
	const isCompletedGroupRef = useRef(false);

	const methods = useForm({
		mode: 'onChange',
		defaultValues: {},
		resolver: zodResolver(isNewGroup ? createSchema : editSchema)
	});

	const { reset, watch } = methods;

	const form = watch();
	const { status } = form;

	useEffect(() => {
		if (group) {
			reset({ ...group });
			// 只在第一次載入資料時設定 isCompletedGroup
			isCompletedGroupRef.current = !isNewGroup && group.status === GROUP_STATUSES.COMPLETED;
		}
	}, [group, reset, isNewGroup]);

	useEffect(() => {
		if (isNewGroup) {
			const defaultValues = GroupModel({});

			// 如果有 URL 參數的出發日期，設定為預設值
			if (defaultDepartureDate) {
				defaultValues.departureDate = new Date(defaultDepartureDate);
			}

			reset(defaultValues);
		}
	}, [groupCode, reset, isNewGroup, defaultDepartureDate]);

	/**
	 * Tab Change
	 */
	function handleTabChange(event: SyntheticEvent, value: string) {
		// 如果是新增模式，只允許切換到基本資料標籤
		if (isNewGroup && value !== 'basic-info') {
			return;
		}

		setTabValue(value);
	}

	if (isLoading) {
		return <FuseLoading />;
	}

	/**
	 * Show Message if the requested groups is not exists
	 */
	if (isError && !isNewGroup) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1, transition: { delay: 0.1 } }}
				className="flex flex-col flex-1 items-center justify-center h-full"
			>
				<Typography
					color="text.secondary"
					variant="h5"
				>
					There is no such group!
				</Typography>
				<Button
					className="mt-6"
					component={Link}
					variant="outlined"
					to="/groups"
					color="inherit"
				>
					Go to Groups Page
				</Button>
			</motion.div>
		);
	}

	/**
	 * Wait while group data is loading and form is setted
	 */
	if (_.isEmpty(form) || (group && routeParams.groupCode !== group.groupCode && !isNewGroup)) {
		return <FuseLoading />;
	}

	// 定義標籤樣式，新增模式下非基本資料標籤會被禁用，已結團狀態下所有標籤都只能查看不能編輯
	const getTabStyle = (tabId: string) => {
		if (isNewGroup && tabId !== 'basic-info') {
			return {
				opacity: 0.5,
				pointerEvents: 'none',
				cursor: 'not-allowed'
			};
		}

		return {};
	};

	return (
		<FormProvider {...methods}>
			<FusePageCarded
				header={<GroupHeader canDelete={Boolean(FuseUtils.hasPermission(authRoles.accountant, userRole))} />}
				content={
					<div className="p-4 sm:p-6 space-y-6">
						{isCompletedGroupRef.current && (
							<div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
								<p className="font-bold">注意：此團已結團</p>
								<p>團組資料僅供查看，無法編輯。</p>
							</div>
						)}
						<FuseTabs
							value={tabValue}
							onChange={handleTabChange}
						>
							<FuseTab
								value="basic-info"
								label="基本資料"
							/>
							<FuseTab
								value="orders"
								label="訂單資料"
								style={getTabStyle('orders')}
							/>
							<FuseTab
								value="travellers"
								label="旅客維護"
								style={getTabStyle('travellers')}
							/>
							<FuseTab
								value="group-report"
								label="團報表"
								style={getTabStyle('group-report')}
							/>
							<FuseTab
								value="bonus-setting"
								label="獎金設定"
								hidden={!FuseUtils.hasPermission(authRoles.accountant, userRole)}
								style={getTabStyle('bonus-setting')}
							/>
							<FuseTab
								value="profit-report"
								label="總報表"
								style={getTabStyle('profit-report')}
								hidden={!FuseUtils.hasPermission(authRoles.accountant, userRole)}
							/>
						</FuseTabs>
						<div className="">
							{tabValue === 'basic-info' && (
								<Suspense fallback={<FuseLoading />}>
									<BasicInfoTab
										showAllOptions={Boolean(
											FuseUtils.hasPermission(authRoles.accountant, userRole)
										)}
									/>
								</Suspense>
							)}
							{tabValue === 'orders' && (
								<Suspense fallback={<FuseLoading />}>
									<OrdersTab />
								</Suspense>
							)}
							{tabValue === 'travellers' && (
								<Suspense fallback={<FuseLoading />}>
									<TravellersTab />
								</Suspense>
							)}
							{tabValue === 'bonus-setting' && (
								<Suspense fallback={<FuseLoading />}>
									<BonusSettingTab />
								</Suspense>
							)}
							{tabValue === 'group-report' && (
								<Suspense fallback={<FuseLoading />}>
									<GroupReportTab />
								</Suspense>
							)}
							{tabValue === 'profit-report' && (
								<Suspense fallback={<FuseLoading />}>
									<ProfitTab />
								</Suspense>
							)}
						</div>
					</div>
				}
				scroll={isMobile ? 'normal' : 'content'}
			/>
		</FormProvider>
	);
}

export default Group;
