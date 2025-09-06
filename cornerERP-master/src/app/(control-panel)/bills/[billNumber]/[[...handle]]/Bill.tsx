'use client';

import FuseLoading from '@fuse/core/FuseLoading';
import FusePageCarded from '@fuse/core/FusePageCarded';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from '@fuse/core/Link';
import _ from 'lodash';
import { FormProvider, useForm } from 'react-hook-form';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import useNavigate from '@fuse/hooks/useNavigate';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import BillHeader from './BillHeader';
import BillModel from '../../models/BillModel';
import { useGetBillQuery } from '../../BillApi';
import { Tabs, Tab } from '@mui/material';
import BasicInfoTab from './tabs/BasicInfoTab';
import PreviewTab from './tabs/PreviewTab';
import LivePreviewTab from './tabs/LivePreviewTab';
import { BILL_STATUSES } from '@/constants/billStatuses';
import { INVOICE_STATUS } from '@/constants/invoiceStatus';
import { useGetFilteredInvoicesQuery } from '@/app/(control-panel)/invoices/InvoiceApi';
import { Bill as BillType } from '../../BillApi';
import { InvoiceDataContext } from './InvoiceContext';

const schema = z.object({
	billDate: z.union([z.string(), z.date()]),
	status: z.number(),
	invoiceNumbers: z.array(z.string())
});

function Bill() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const routeParams = useParams<{ billNumber: string; handle: string[] }>();
	const { billNumber, handle } = routeParams;
	const isNewBill = billNumber === 'new';

	// 根據URL參數設置初始標籤
	const [activeTab, setActiveTab] = useState(() => {
		if (handle && handle.length > 0) {
			switch (handle[0]) {
				case 'preview':
					return 1;
				case 'live-preview':
					return 2;
				default:
					return 0;
			}
		}

		return 0;
	});

	const navigate = useNavigate();

	const {
		data: bill,
		isLoading,
		isError
	} = useGetBillQuery(billNumber, {
		skip: !billNumber || billNumber === 'new'
	});

	const methods = useForm({
		mode: 'onChange',
		defaultValues: {},
		resolver: zodResolver(schema)
	});

	const { reset, watch } = methods;
	const formValues = watch() as BillType;

	// 從表單獲取選中的發票編號
	const selectedInvoiceNumbers = watch('invoiceNumbers') || [];

	// 直接根據表單值建立API查詢參數
	const queryParams = useMemo(
		() => ({
			status: [INVOICE_STATUS.PENDING],
			invoiceNumbers: selectedInvoiceNumbers
		}),
		[selectedInvoiceNumbers]
	);

	// 中央查詢發票資料
	const {
		data: invoices = [],
		isLoading: isInvoicesLoading,
		error: invoicesError,
		refetch: refetchInvoices
	} = useGetFilteredInvoicesQuery(queryParams, {
		refetchOnMountOrArgChange: false,
		refetchOnFocus: false,
		refetchOnReconnect: false,
		skip: billNumber !== 'new' && !bill
	});

	useEffect(() => {
		if (billNumber === 'new') {
			// 保留現有的 invoiceNumbers，避免重置選中的資料
			const currentInvoiceNumbers = watch('invoiceNumbers');
			reset({
				...BillModel({}),
				invoiceNumbers: currentInvoiceNumbers || []
			});
		}
	}, [billNumber, reset, watch]);

	useEffect(() => {
		if (bill) {
			reset({ ...bill });
		}
	}, [bill, reset]);

	const handleTabChange = (event, newValue) => {
		setActiveTab(newValue);
		// 暫時移除 URL 更新，使用純 state 管理 Tab 切換
		// 避免路由變更導致組件重新載入
	};

	if (isLoading) {
		return <FuseLoading />;
	}

	if (isError && billNumber !== 'new') {
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
					找不到此出納單！
				</Typography>
				<Button
					className="mt-6"
					component={Link}
					variant="outlined"
					to="/bills"
					color="inherit"
				>
					返回出納單列表
				</Button>
			</motion.div>
		);
	}

	if (_.isEmpty(formValues)) {
		return <FuseLoading />;
	}

	// 準備要通過context傳遞的發票資料
	const invoiceDataValue = {
		invoices,
		isLoading: isInvoicesLoading,
		error: invoicesError,
		refetch: refetchInvoices
	};

	return (
		<FormProvider {...methods}>
			<InvoiceDataContext.Provider value={invoiceDataValue}>
				<FusePageCarded
					header={<BillHeader activeTab={activeTab} />}
					content={
						<div className="p-4 sm:p-6 space-y-6">
							<Tabs
								value={activeTab}
								onChange={handleTabChange}
								indicatorColor="primary"
								textColor="primary"
								variant="scrollable"
								scrollButtons="auto"
								className="border-b-1"
							>
								<Tab label="基本資料" />
								<Tab
									label="實時預覽"
									id="live-preview-tab"
								/>
								<Tab
									label="出納單瀏覽"
									id="preview-tab"
									disabled={isNewBill}
								/>
							</Tabs>

							<div className="mt-4">
								{activeTab === 0 && <BasicInfoTab isReadOnly={bill?.status === BILL_STATUSES.PAID} />}
								{activeTab === 1 && <LivePreviewTab />}
								{activeTab === 2 && <PreviewTab bill={bill} />}
							</div>
						</div>
					}
					scroll={isMobile ? 'normal' : 'content'}
				/>
			</InvoiceDataContext.Provider>
		</FormProvider>
	);
}

export default Bill;
