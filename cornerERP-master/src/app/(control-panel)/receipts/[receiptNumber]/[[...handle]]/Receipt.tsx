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
import ReceiptHeader from './ReceiptHeader';
import ReceiptModel from '../../models/ReceiptModel';
import { useGetReceiptQuery } from '../../ReceiptApi';
import BasicInfoTab from './tabs/BasicInfoTab';
import { RECEIPT_STATUS } from '@/constants/receiptStatus';
import { createReceiptSchema } from '../../schemas/receiptSchema';

// 使用共用 schema
const schema = createReceiptSchema();

function Receipt() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const routeParams = useParams<{ receiptNumber: string }>();
	const { receiptNumber } = routeParams;

	const {
		data: receipt,
		isLoading,
		isError
	} = useGetReceiptQuery(receiptNumber, {
		skip: !receiptNumber || receiptNumber === 'new'
	});

	const methods = useForm({
		mode: 'onChange',
		defaultValues: {
			receiptType: null,
			status: RECEIPT_STATUS.PENDING,
			receiptAmount: 0,
			actualAmount: 0,
			receiptNumber: '',
			orderNumber: '',
			receiptAccount: '',
			email: '',
			note: '',
			paymentName: '',
			linkpay: []
		},
		resolver: zodResolver(schema)
	});

	const { reset, watch } = methods;
	const form = watch();

	useEffect(() => {
		if (receiptNumber === 'new') {
			reset({ ...ReceiptModel({}), paymentName: '' });
		}
	}, [receiptNumber, reset]);

	useEffect(() => {
		if (receipt) {
			reset({ ...ReceiptModel(receipt), linkpay: receipt.linkpay, paymentName: '' });
		}
	}, [receipt, reset]);

	if (isLoading) {
		return <FuseLoading />;
	}

	if (isError && receiptNumber !== 'new') {
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
					找不到此收款單！
				</Typography>
				<Button
					className="mt-6"
					component={Link}
					variant="outlined"
					to="/receipts"
					color="inherit"
				>
					返回收款單列表
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
				header={<ReceiptHeader />}
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

export default Receipt;
