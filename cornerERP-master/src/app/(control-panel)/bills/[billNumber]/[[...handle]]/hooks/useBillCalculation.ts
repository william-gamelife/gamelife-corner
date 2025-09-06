import { useMemo } from 'react';
import { processBillInvoices, calculateBillTotalAmount, InvoiceGroup, InvoiceItemForBill } from '@/utils/calculations';
import { INVOICE_ITEM_TYPES } from '@/constants/invoiceItemTypes';

// 定義付款對象類型
const PAYMENT_TYPES = {
	CUSTOMER_REFUND: '客戶退款專用',
	FOREIGN_PAYMENT: '外幣請款專用'
};

export interface BillInvoice {
	invoiceNumber: string;
	createdBy: string;
	groupName?: string;
	groupCode: string;
	invoiceItems?: {
		payFor: string;
		note?: string;
		invoiceType: number;
		price: number;
		quantity: number;
	}[];
}

export interface UseBillCalculationParams {
	invoices: BillInvoice[];
	getUserName: (code: string) => string;
	getSupplierName: (code: string) => string;
	getInvoiceItemTypeName: (type: number) => string;
	maxGroupSize?: number;
}

export interface BillCalculationResult {
	invoiceGroups: InvoiceGroup[];
	totalAmount: number;
}

/**
 * 出納單計算 Hook
 * 將 PreviewTab 的複雜計算邏輯抽離為可復用的 hook
 */
export function useBillCalculation({
	invoices,
	getUserName,
	getSupplierName,
	getInvoiceItemTypeName,
	maxGroupSize = 5
}: UseBillCalculationParams): BillCalculationResult {
	const result = useMemo(() => {
		if (!invoices || invoices.length === 0) {
			return {
				invoiceGroups: [],
				totalAmount: 0
			};
		}

		// 使用統一的計算函數處理發票
		const invoiceGroups = processBillInvoices(
			invoices as {
				invoiceNumber: string;
				createdBy: string;
				groupName?: string;
				groupCode: string;
				invoiceItems?: InvoiceItemForBill[];
			}[],
			getUserName,
			getSupplierName,
			getInvoiceItemTypeName,
			INVOICE_ITEM_TYPES.REFUND,
			PAYMENT_TYPES,
			maxGroupSize
		);

		// 計算總金額
		const totalAmount = calculateBillTotalAmount(invoiceGroups);

		return {
			invoiceGroups,
			totalAmount
		};
	}, [invoices, getUserName, getSupplierName, getInvoiceItemTypeName, maxGroupSize]);

	return result;
}

/**
 * 簡化版的出納單計算 Hook（僅返回總金額）
 */
export function useBillSummary({
	invoices,
	getUserName,
	getSupplierName,
	getInvoiceItemTypeName
}: Omit<UseBillCalculationParams, 'maxGroupSize'>) {
	return useMemo(() => {
		if (!invoices || invoices.length === 0) {
			return { totalAmount: 0 };
		}

		const invoiceGroups = processBillInvoices(
			invoices as {
				invoiceNumber: string;
				createdBy: string;
				groupName?: string;
				groupCode: string;
				invoiceItems?: InvoiceItemForBill[];
			}[],
			getUserName,
			getSupplierName,
			getInvoiceItemTypeName,
			INVOICE_ITEM_TYPES.REFUND,
			PAYMENT_TYPES
		);

		const totalAmount = calculateBillTotalAmount(invoiceGroups);

		return { totalAmount };
	}, [invoices, getUserName, getSupplierName, getInvoiceItemTypeName]);
}
