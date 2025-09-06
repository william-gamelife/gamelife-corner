import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { getInvoiceItemTypeName } from 'src/constants/invoiceItemTypes';
import { useUserDictionary } from '@/app/(control-panel)/users/hooks/useUserDictionary';
import { useSupplierDictionary } from '@/app/(control-panel)/suppliers/hooks/useSupplierDictionary';
import { useBillCalculation } from '../hooks/useBillCalculation';
import { useInvoiceData } from '../InvoiceContext';
import { BillPreviewContainer } from './components/BillPreviewContainer';

/**
 * 實時預覽 Tab
 * 根據 BasicInfoTab 中選擇的發票編號即時顯示預覽
 */
function LivePreviewTab() {
	const { control, watch } = useFormContext();
	const { getUserName } = useUserDictionary();
	const { getSupplierName } = useSupplierDictionary();

	// 從 Context 取得所有可用的發票資料
	const { invoices: allInvoices } = useInvoiceData();

	// 獲取當前出納單數據
	const billNumber = watch('billNumber');
	const billDate = watch('billDate');

	// 監聽表單中選中的發票編號
	const selectedInvoiceNumbers = useWatch({
		control,
		name: 'invoiceNumbers',
		defaultValue: []
	});

	// 根據選中的發票編號篩選出對應的發票資料
	const selectedInvoices = useMemo(() => {
		if (!selectedInvoiceNumbers.length || !allInvoices.length) {
			return [];
		}

		return allInvoices.filter((invoice) => selectedInvoiceNumbers.includes(invoice.invoiceNumber));
	}, [allInvoices, selectedInvoiceNumbers]);

	// 使用共用的計算 hook 處理發票資料
	const { invoiceGroups, totalAmount } = useBillCalculation({
		invoices: selectedInvoices,
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
			cardId="live-preview"
		/>
	);
}

export default LivePreviewTab;
