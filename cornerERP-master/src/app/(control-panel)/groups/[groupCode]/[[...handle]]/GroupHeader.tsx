import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'next/navigation';
import _ from 'lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import useNavigate from '@fuse/hooks/useNavigate';
import { Group, useCreateGroupMutation, useDeleteGroupMutation, useUpdateGroupMutation } from '../../GroupApi';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { maxNumberGetDbNumber } from '@/@max-numbers/maxNumberApi';
import { useCreateGroupBonusSettingMutation } from '@/app/(control-panel)/groups/GroupBonusSettingApi';
import { useCreateOrderMutation } from '@/app/(control-panel)/orders/OrderApi';
import { BONUS_SETTING_TYPES, BONUS_CALCULATION_TYPES } from '@/constants/bonusSettingTypes';
import { GROUP_STATUSES, GROUP_STATUS_NAMES } from '@/constants/groupStatuses';
import handleCreatePDF from './BonusPdf';
import { useState, useEffect } from 'react';
import LoadingButton from '@/components/common/LoadingButton';

/**
 * The product header.
 */
function ProductHeader({ canDelete }: { canDelete: boolean }) {
	const routeParams = useParams<{ groupCode: string }>();
	const { groupCode } = routeParams;
	const isNewGroup = groupCode === 'new'; // 新增變數判斷是否為新增狀態

	const [createGroup] = useCreateGroupMutation();
	const [saveGroup] = useUpdateGroupMutation();
	const [removeGroup] = useDeleteGroupMutation();
	const [createBonusSetting] = useCreateGroupBonusSettingMutation();
	const [createOrder] = useCreateOrderMutation();

	const methods = useFormContext();
	const { formState, watch, getValues } = methods;
	const { isValid, dirtyFields } = formState;

	const navigate = useNavigate();
	const { session, user } = useAuth();

	const { groupName, status } = watch() as Group;

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isRemoving, setIsRemoving] = useState(false);
	const [isEditDisabled, setIsEditDisabled] = useState(false);
	const [initialStatus, setInitialStatus] = useState<number | null>(null);

	// 在組件初始載入時設置初始狀態
	useEffect(() => {
		if (!isNewGroup && status && initialStatus === null) {
			setInitialStatus(status);
			setIsEditDisabled(!isNewGroup && initialStatus === GROUP_STATUSES.COMPLETED);
		}
	}, [isNewGroup, status, initialStatus]);

	// 根據初始團狀態決定是否允許編輯，而非當前可能已被修改的狀態

	async function handleSaveGroup() {
		setIsSubmitting(true);
		try {
			await saveGroup(getValues() as Group);
		} catch (error) {
			console.error('儲存群組失敗:', error);
		} finally {
			setIsSubmitting(false);
		}
	}

	// 創建預設的獎金設定
	async function createDefaultBonusSettings(newGroupCode: string) {
		const currentTime = new Date();
		const userId = user?.id || '';

		// 預設獎金設定
		const defaultSettings = [
			{
				groupCode: newGroupCode,
				type: BONUS_SETTING_TYPES.PROFIT_TAX,
				bonus: 12,
				bonusType: BONUS_CALCULATION_TYPES.PERCENT,
				createdBy: userId,
				createdAt: currentTime
			},
			{
				groupCode: newGroupCode,
				type: BONUS_SETTING_TYPES.SALE_BONUS,
				bonus: 45,
				bonusType: BONUS_CALCULATION_TYPES.PERCENT,
				createdBy: userId,
				createdAt: currentTime
			},
			{
				groupCode: newGroupCode,
				type: BONUS_SETTING_TYPES.OP_BONUS,
				bonus: 10,
				bonusType: BONUS_CALCULATION_TYPES.PERCENT,
				createdBy: userId,
				createdAt: currentTime
			},
			{
				groupCode: newGroupCode,
				type: BONUS_SETTING_TYPES.TEAM_BONUS,
				bonus: 5,
				bonusType: BONUS_CALCULATION_TYPES.PERCENT,
				createdBy: userId,
				createdAt: currentTime
			},
			{
				groupCode: newGroupCode,
				type: BONUS_SETTING_TYPES.ADMINISTRATIVE_EXPENSES,
				bonus: 10,
				bonusType: BONUS_CALCULATION_TYPES.FIXED_AMOUNT,
				createdBy: userId,
				createdAt: currentTime
			}
		];

		// 依序創建每個預設設定
		const createPromises = defaultSettings.map((setting) => createBonusSetting(setting).unwrap());

		try {
			await Promise.all(createPromises);
			console.log('所有預設獎金設定已創建');
		} catch (error) {
			console.error('創建預設獎金設定時出錯:', error);
		}
	}

	async function handleCreateGroup() {
		setIsSubmitting(true);
		const values = getValues() as any; // 使用 any 以包含訂單資料
		const departureDate = values.departureDate;

		try {
			// 將日期轉換為 YYMMDD 格式
			const dateKey = format(departureDate, 'yyMMdd');

			// 獲取序號
			const newGroupCode = await maxNumberGetDbNumber(dateKey, 3);

			// 設置團號和創建者資訊，預設狀態為進行中
			const newGroup = {
				..._.omit(values, ['order']), // 排除訂單資料
				groupCode: newGroupCode,
				status: GROUP_STATUSES.IN_PROGRESS, // 預設為進行中
				createdBy: user.id,
				createdAt: new Date(),
				modifiedBy: user.id,
				modifiedAt: new Date()
			} as Group;

			// 創建團組
			const createdGroup = await createGroup(newGroup).unwrap();

			// 創建預設的獎金設定
			await createDefaultBonusSettings(createdGroup.groupCode);

			// 如果有填寫訂單資訊，則創建訂單
			if (values.order && values.order.contactPerson) {
				try {
					// 生成訂單編號
					const orderNumber = await maxNumberGetDbNumber(createdGroup.groupCode, 2);

					// 創建訂單資料
					const orderData = {
						orderNumber,
						groupCode: createdGroup.groupCode,
						contactPerson: values.order.contactPerson,
						contactPhone: values.order.contactPhone,
						salesPerson: values.order.salesPerson,
						opId: values.order.opId,
						orderType: '一般', // 預設訂單類型
						createdBy: user.id,
						createdAt: new Date(),
						modifiedBy: user.id,
						modifiedAt: new Date()
					};

					await createOrder(orderData).unwrap();
					console.log('訂單創建成功');
				} catch (orderError) {
					console.error('創建訂單時出錯:', orderError);
					// 訂單創建失敗不影響團組創建，僅記錄錯誤
				}
			}

			// 導航到新創建的團組頁面
			navigate(`/groups/${createdGroup.groupCode}`);
		} catch (error) {
			console.error('創建團組時出錯:', error);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleRemoveGroup() {
		setIsRemoving(true);
		try {
			await removeGroup(groupCode).unwrap();
			navigate('/groups');
		} catch (error) {
			console.error('刪除團組時出錯:', error);
		} finally {
			setIsRemoving(false);
		}
	}

	return (
		<div className="flex flex-col sm:flex-row flex-1 w-full items-center justify-between space-y-2 sm:space-y-0 py-6 sm:py-8">
			<div className="flex flex-col items-start space-y-2 sm:space-y-0 w-full sm:max-w-full min-w-0">
				<motion.div
					initial={{
						x: 20,
						opacity: 0
					}}
					animate={{
						x: 0,
						opacity: 1,
						transition: { delay: 0.3 }
					}}
				>
					<PageBreadcrumb
						className="mb-2"
						prevPage={true}
					/>
				</motion.div>

				<div className="flex items-center max-w-full space-x-3">
					<motion.div
						className="flex flex-col min-w-0"
						initial={{ x: -20 }}
						animate={{ x: 0, transition: { delay: 0.3 } }}
					>
						<Typography className="text-lg sm:text-2xl truncate font-semibold">
							{isNewGroup ? 'New Group' : groupName}
						</Typography>
						<Typography
							variant="caption"
							className="font-medium"
						>
							{!isNewGroup && `狀態: ${GROUP_STATUS_NAMES[status]}`}
						</Typography>
					</motion.div>
				</div>
			</div>
			<motion.div
				className="flex flex-1 w-full"
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
			>
				{groupCode !== 'new' ? (
					<>
						{canDelete && (
							<LoadingButton
								className="whitespace-nowrap mx-1"
								variant="contained"
								color="secondary"
								onClick={handleRemoveGroup}
								disabled={isEditDisabled || isRemoving || isSubmitting}
								isLoading={isRemoving}
								loadingText="刪除中..."
								startIcon={
									<FuseSvgIcon className="hidden sm:flex">heroicons-outline:trash</FuseSvgIcon>
								}
							>
								刪除
							</LoadingButton>
						)}
						<Button
							className="whitespace-nowrap mx-4"
							variant="contained"
							color="primary"
							disabled={isRemoving || isSubmitting}
							onClick={() => handleCreatePDF(groupCode, groupName)}
							startIcon={
								<FuseSvgIcon className="hidden sm:flex">heroicons-outline:arrow-down-tray</FuseSvgIcon>
							}
						>
							匯出
						</Button>

						<LoadingButton
							className="whitespace-nowrap mx-1"
							variant="contained"
							color="secondary"
							disabled={
								_.isEmpty(dirtyFields) || !isValid || isEditDisabled || isRemoving || isSubmitting
							}
							onClick={handleSaveGroup}
							isLoading={isSubmitting}
							loadingText="處理中..."
							startIcon={<FuseSvgIcon>heroicons-outline:check</FuseSvgIcon>}
						>
							儲存
						</LoadingButton>
					</>
				) : (
					<LoadingButton
						className="whitespace-nowrap mx-1"
						variant="contained"
						color="secondary"
						disabled={_.isEmpty(dirtyFields) || !isValid}
						onClick={handleCreateGroup}
						isLoading={isSubmitting}
						loadingText="新增中..."
						startIcon={<FuseSvgIcon>heroicons-outline:plus</FuseSvgIcon>}
					>
						新增
					</LoadingButton>
				)}
			</motion.div>
		</div>
	);
}

export default ProductHeader;
