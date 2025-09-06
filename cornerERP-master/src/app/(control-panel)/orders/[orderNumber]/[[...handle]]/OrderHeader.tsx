import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'next/navigation';
import _ from 'lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import useNavigate from '@fuse/hooks/useNavigate';
import { useAuth } from '@/contexts/AuthContext';
import { Order, useCreateOrderMutation, useDeleteOrderMutation, useUpdateOrderMutation } from '../../OrderApi';
import { maxNumberGetDbNumber } from '@/@max-numbers/maxNumberApi';
import { useState } from 'react';
import LoadingButton from '@/components/common/LoadingButton';

function OrderHeader() {
	const routeParams = useParams<{ orderNumber: string }>();
	const { orderNumber } = routeParams;
	const isNewOrder = orderNumber === 'new';

	const [createOrder] = useCreateOrderMutation();
	const [saveOrder] = useUpdateOrderMutation();
	const [removeOrder] = useDeleteOrderMutation();

	const methods = useFormContext();
	const { formState, watch, getValues } = methods;
	const { isValid, dirtyFields } = formState;

	const navigate = useNavigate();
	const { session, user } = useAuth();

	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSaveOrder() {
		setIsSubmitting(true);
		try {
			await saveOrder(getValues());
		} catch (error) {
			console.error('儲存訂單失敗:', error);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleCreateOrder() {
		setIsSubmitting(true);
		const values = getValues() as Order;
		const newOrderNumber = await maxNumberGetDbNumber(values.groupCode, 2);
		const newOrder = {
			...values,
			orderNumber: newOrderNumber,
			createdBy: user.id,
			createdAt: new Date(),
			modifiedBy: user.id,
			modifiedAt: new Date()
		} as Order;

		createOrder(newOrder)
			.unwrap()
			.then((data) => {
				navigate(`/orders/${data.orderNumber}`);
			})
			.finally(() => {
				setIsSubmitting(false);
			});
	}

	function handleRemoveOrder() {
		removeOrder(orderNumber);
		navigate('/orders');
	}

	return (
		<div className="flex flex-col sm:flex-row flex-1 w-full items-center justify-between space-y-2 sm:space-y-0 py-6 sm:py-8">
			<div className="flex flex-col items-start space-y-2 sm:space-y-0 w-full sm:max-w-full min-w-0">
				<motion.div
					initial={{ x: 20, opacity: 0 }}
					animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
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
							{isNewOrder ? '新增訂單' : orderNumber}
						</Typography>
						<Typography
							variant="caption"
							className="font-medium"
						>
							訂單詳情
						</Typography>
					</motion.div>
				</div>
			</div>
			<motion.div
				className="flex flex-1 w-full"
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
			>
				{orderNumber !== 'new' ? (
					<>
						<Button
							className="whitespace-nowrap mx-1"
							variant="contained"
							color="secondary"
							onClick={handleRemoveOrder}
							startIcon={<FuseSvgIcon className="hidden sm:flex">heroicons-outline:trash</FuseSvgIcon>}
						>
							刪除
						</Button>
						<LoadingButton
							className="whitespace-nowrap mx-1"
							variant="contained"
							color="secondary"
							disabled={_.isEmpty(dirtyFields) || !isValid}
							onClick={handleSaveOrder}
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
						onClick={handleCreateOrder}
						isLoading={isSubmitting}
						loadingText="處理中..."
						startIcon={<FuseSvgIcon>heroicons-outline:check</FuseSvgIcon>}
					>
						新增
					</LoadingButton>
				)}
			</motion.div>
		</div>
	);
}

export default OrderHeader;
