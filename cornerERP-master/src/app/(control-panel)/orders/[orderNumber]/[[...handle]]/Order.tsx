'use client';

import FuseLoading from '@fuse/core/FuseLoading';
import FusePageCarded from '@fuse/core/FusePageCarded';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from '@fuse/core/Link';
import _ from 'lodash';
import { FormProvider, useForm } from 'react-hook-form';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import OrderHeader from './OrderHeader';
import OrderModel from '../../models/OrderModel';
import { useGetOrderQuery } from '../../OrderApi';
import BasicInfoTab from './tabs/BasicInfoTab';

const schema = z.object({
	orderNumber: z.string(),
	groupCode: z.string().min(1, '團號不能為空'),
	contactPerson: z.string().min(1, '聯絡人不能為空'),
	contactPhone: z.string().min(1, '聯絡電話不能為空'),
	salesPerson: z.string().min(1, '業務員不能為空'),
	opId: z.string().min(1, 'OP員不能為空')
});

function Order() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const routeParams = useParams<{ orderNumber: string }>();
	const { orderNumber } = routeParams;
	const isNewOrder = orderNumber === 'new';

	const {
		data: order,
		isLoading,
		isError
	} = useGetOrderQuery(orderNumber, {
		skip: !orderNumber || orderNumber === 'new'
	});

	const methods = useForm({
		mode: 'onChange',
		defaultValues: {},
		resolver: zodResolver(schema)
	});

	const { reset, watch } = methods;
	const form = watch();

	useEffect(() => {
		if (orderNumber === 'new') {
			reset(OrderModel({}));
		}
	}, [orderNumber, reset]);

	useEffect(() => {
		if (order) {
			reset({ ...order });
		}
	}, [order, reset]);

	if (isLoading) {
		return <FuseLoading />;
	}

	if (isError && orderNumber !== 'new') {
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
					找不到此訂單！
				</Typography>
				<Button
					className="mt-6"
					component={Link}
					variant="outlined"
					to="/orders"
					color="inherit"
				>
					返回訂單列表
				</Button>
			</motion.div>
		);
	}

	if (_.isEmpty(form)) {
		return <FuseLoading />;
	}

	return (
		<FormProvider {...methods}>
			<FusePageCarded
				header={<OrderHeader />}
				content={
					<div className="p-4 sm:p-6 max-w-5xl space-y-6">
						<div className="">
							<BasicInfoTab />
						</div>
					</div>
				}
				scroll={isMobile ? 'normal' : 'content'}
			/>
		</FormProvider>
	);
}

export default Order;
