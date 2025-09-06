import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'next/navigation';
import _ from 'lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import useNavigate from '@fuse/hooks/useNavigate';
import { Customer, useCreateCustomerMutation, useUpdateCustomerMutation } from '../CustomerApi';
import { useState } from 'react';
import LoadingButton from '@/components/common/LoadingButton';

/**
 * The customer header.
 */
function CustomerHeader() {
	const routeParams = useParams<{ id: string }>();
	const { id: customerId } = routeParams;
	const isNewCustomer = customerId === 'new';

	const [createCustomer] = useCreateCustomerMutation();
	const [saveCustomer] = useUpdateCustomerMutation();

	const methods = useFormContext();
	const { formState, getValues } = methods;
	const { isValid, dirtyFields } = formState;

	const navigate = useNavigate();

	const form = getValues();
	const { name } = form as Customer;

	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSaveCustomer() {
		setIsSubmitting(true);
		try {
			await saveCustomer(getValues() as Customer);
		} catch (error) {
			console.error('儲存顧客失敗:', error);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleCreateCustomer() {
		setIsSubmitting(true);
		try {
			const values = getValues() as Customer;
			const createdCustomer = await createCustomer(values).unwrap();
			// 導航到新創建的顧客頁面
			navigate(`/customers/${createdCustomer.id}`);
		} catch (error) {
			console.error('創建顧客時出錯:', error);
		} finally {
			setIsSubmitting(false);
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
							{isNewCustomer ? '新增顧客' : name || '顧客詳細資料'}
						</Typography>
						<Typography
							variant="caption"
							className="font-medium"
						>
							{!isNewCustomer && customerId && `身份證號: ${customerId}`}
						</Typography>
					</motion.div>
				</div>
			</div>
			<motion.div
				className="flex flex-1 w-full justify-end"
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
			>
				{customerId !== 'new' ? (
					<LoadingButton
						className="whitespace-nowrap mx-1"
						variant="contained"
						color="secondary"
						disabled={_.isEmpty(dirtyFields) || !isValid || isSubmitting}
						onClick={handleSaveCustomer}
						isLoading={isSubmitting}
						loadingText="儲存中..."
						startIcon={<FuseSvgIcon>heroicons-outline:check</FuseSvgIcon>}
					>
						儲存
					</LoadingButton>
				) : (
					<LoadingButton
						className="whitespace-nowrap mx-1"
						variant="contained"
						color="secondary"
						disabled={_.isEmpty(dirtyFields) || !isValid}
						onClick={handleCreateCustomer}
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

export default CustomerHeader;
