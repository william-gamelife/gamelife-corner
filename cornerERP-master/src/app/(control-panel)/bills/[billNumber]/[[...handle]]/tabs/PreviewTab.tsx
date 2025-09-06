import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useGetFilteredInvoicesQuery } from '@/app/(control-panel)/invoices/InvoiceApi';
import { getInvoiceItemTypeName } from 'src/constants/invoiceItemTypes';
import { useUserDictionary } from '@/app/(control-panel)/users/hooks/useUserDictionary';
import { useSupplierDictionary } from '@/app/(control-panel)/suppliers/hooks/useSupplierDictionary';
import { useBillCalculation } from '../hooks/useBillCalculation';
import { BillPreviewContainer } from './components/BillPreviewContainer';
import { Bill } from '../../BillApi';

interface PreviewTabProps {
	bill?: Bill;
}

/**
 * 出納單預覽 Tab
 * 顯示資料庫中已儲存的出納單內容
 */
function PreviewTab({ bill }: PreviewTabProps) {
	const { watch } = useFormContext();

	// 獲取當前出納單基本資料
	const billNumber = watch('billNumber');
	const billDate = watch('billDate');

	// 使用資料庫中的發票編號，而非表單中的即時選擇
	const savedInvoiceNumbers = bill?.invoiceNumbers || [];

	// 使用用戶字典和供應商字典
	const { getUserName } = useUserDictionary();
	const { getSupplierName } = useSupplierDictionary();

	// 根據資料庫中已儲存的發票編號建立查詢參數
	const queryParams = useMemo(
		() => ({
			invoiceNumbers: [...savedInvoiceNumbers]
		}),
		[savedInvoiceNumbers]
	);

	// 從資料庫獲取已儲存的發票數據
	const { data: invoices = [] } = useGetFilteredInvoicesQuery(queryParams, {
		skip: queryParams.invoiceNumbers.length === 0,
		refetchOnMountOrArgChange: true
	});

	// 使用重構後的出納單計算 hook
	const { invoiceGroups, totalAmount } = useBillCalculation({
		invoices,
		getUserName,
		getSupplierName,
		getInvoiceItemTypeName,
		maxGroupSize: 5
	});

	return (
		<BillPreviewContainer
			billNumber={billNumber}
			billDate={billDate}
			invoiceGroups={invoiceGroups}
			totalAmount={totalAmount}
			cardId="preview"
		/>
	);
}

export default PreviewTab;
