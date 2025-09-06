'use client';

import FuseLoading from '@fuse/core/FuseLoading';
import FusePageCarded from '@fuse/core/FusePageCarded';
import { useEffect } from 'react';
import _ from 'lodash';
import { FormProvider, useForm } from 'react-hook-form';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { zodResolver } from '@hookform/resolvers/zod';
import BatchCreateReceiptHeader from './BatchCreateReceiptHeader';
import BatchCreateReceiptModel from '../models/BatchCreateReceiptModel';
import BasicInfoTab from './tabs/BasicInfoTab';
import { createBatchReceiptSchema } from '../schemas/receiptSchema';

/**
 * 表單驗證模式
 */
const schema = createBatchReceiptSchema();

function BatchCreateReceipt() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	const methods = useForm({
		mode: 'onChange',
		defaultValues: {},
		resolver: zodResolver(schema)
	});

	const { reset, watch } = methods;
	const form = watch();

	useEffect(() => {
		reset(BatchCreateReceiptModel({}));
	}, [reset]);

	if (_.isEmpty(form)) {
		return <FuseLoading />;
	}

	return (
		<FormProvider {...methods}>
			<FusePageCarded
				header={<BatchCreateReceiptHeader />}
				content={
					<div className="p-4 sm:p-6 space-y-6">
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

export default BatchCreateReceipt;
