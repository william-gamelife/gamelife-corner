'use client';

import FuseLoading from '@fuse/core/FuseLoading';
import FusePageCarded from '@fuse/core/FusePageCarded';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { SyntheticEvent, useEffect, useState, Suspense, lazy } from 'react';
import { useParams } from 'next/navigation';
import Link from '@fuse/core/Link';
import _ from 'lodash';
import { FormProvider, useForm } from 'react-hook-form';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FuseTabs from 'src/components/tabs/FuseTabs';
import FuseTab from 'src/components/tabs/FuseTab';
import CustomerHeader from './CustomerHeader';
import CustomerModel from '../models/CustomerModel';
import { useGetCustomerQuery } from '../CustomerApi';

// 動態導入各標籤頁面
const BasicInfoTab = lazy(() => import('./tabs/BasicInfoTab'));
const GroupHistoryTab = lazy(() => import('./tabs/GroupHistoryTab'));

/**
 * Form Validation Schema
 */
const baseSchema = z.object({
	name: z.string().min(1, '姓名為必填'),
	birthday: z.string().nullable().optional(),
	passportRomanization: z.string().nullable().optional(),
	passportNumber: z.string().nullable().optional(),
	passportValidTo: z.string().nullable().optional(),
	email: z
		.string()
		.nullable()
		.optional()
		.refine((value) => !value || z.string().email().safeParse(value).success, { message: 'Email 格式不正確' }),
	phone: z.string().nullable().optional(),
	note: z.string().nullable().optional(),
	// 系統欄位
	createdAt: z.string().nullable().optional(),
	createdBy: z.string().nullable().optional(),
	modifiedAt: z.string().nullable().optional(),
	modifiedBy: z.string().nullable().optional()
});

// 新增時需要身份證號
const createSchema = baseSchema.extend({
	id: z
		.string()
		.min(1, '身份證號為必填')
		.regex(/^[A-Z][12]\d{8}$/, '身份證號格式不正確')
});

// 編輯時身份證號不可改
const editSchema = baseSchema.extend({
	id: z.string()
});

/**
 * The customer page.
 */
function Customer() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	const routeParams = useParams<{ id: string }>();
	const { id: customerId } = routeParams;

	// 判斷是否為新增模式
	const isNewCustomer = customerId === 'new';

	const {
		data: customer,
		isLoading,
		isError
	} = useGetCustomerQuery(customerId, {
		skip: !customerId || isNewCustomer
	});

	const [tabValue, setTabValue] = useState('basic-info');

	const methods = useForm({
		mode: 'onChange',
		defaultValues: isNewCustomer ? CustomerModel({}) : {},
		resolver: zodResolver(isNewCustomer ? createSchema : editSchema)
	});

	const { reset, watch } = methods;

	const form = watch();

	useEffect(() => {
		if (customer) {
			reset({ ...customer });
		}
	}, [customer, reset]);

	useEffect(() => {
		if (isNewCustomer) {
			const defaultValues = CustomerModel({});
			reset(defaultValues);
		}
	}, [isNewCustomer, reset]);

	/**
	 * Tab Change
	 */
	function handleTabChange(event: SyntheticEvent, value: string) {
		// 如果是新增模式，只允許切換到基本資料標籤
		if (isNewCustomer && value !== 'basic-info') {
			return;
		}

		setTabValue(value);
	}

	if (isLoading) {
		return <FuseLoading />;
	}

	/**
	 * Show Message if the requested customer is not exists
	 */
	if (isError && !isNewCustomer) {
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
					找不到此顧客資料！
				</Typography>
				<Button
					className="mt-6"
					component={Link}
					variant="outlined"
					to="/customers"
					color="inherit"
				>
					回到顧客列表
				</Button>
			</motion.div>
		);
	}

	/**
	 * Wait while customer data is loading and form is setted
	 */
	if (_.isEmpty(form) || (customer && customerId !== customer.id && !isNewCustomer)) {
		return <FuseLoading />;
	}

	// 定義標籤樣式，新增模式下非基本資料標籤會被禁用
	const getTabStyle = (tabId: string) => {
		if (isNewCustomer && tabId !== 'basic-info') {
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
				header={<CustomerHeader />}
				content={
					<div className="p-4 sm:p-6 space-y-6">
						<FuseTabs
							value={tabValue}
							onChange={handleTabChange}
						>
							<FuseTab
								value="basic-info"
								label="基本資料"
							/>
							<FuseTab
								value="group-history"
								label="歷史參團記錄"
								style={getTabStyle('group-history')}
							/>
						</FuseTabs>
						<div className="">
							{tabValue === 'basic-info' && (
								<Suspense fallback={<FuseLoading />}>
									<BasicInfoTab isNewCustomer={isNewCustomer} />
								</Suspense>
							)}
							{tabValue === 'group-history' && !isNewCustomer && (
								<Suspense fallback={<FuseLoading />}>
									<GroupHistoryTab customerId={customerId} />
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

export default Customer;
