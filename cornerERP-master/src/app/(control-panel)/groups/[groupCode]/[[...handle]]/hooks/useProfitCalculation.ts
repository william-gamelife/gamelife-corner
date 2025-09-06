import { useMemo, useCallback } from 'react';
import { Invoice } from '@/app/(control-panel)/invoices/InvoiceApi';
import { Receipt } from '@/app/(control-panel)/receipts/ReceiptApi';
import { GroupBonusSetting } from '@/app/(control-panel)/groups/GroupBonusSettingApi';
import { BONUS_SETTING_TYPES, BONUS_CALCULATION_TYPES, BONUS_SETTING_TYPE_NAMES } from '@/constants/bonusSettingTypes';
import {
	calculateInvoiceTotalFromInvoices,
	calculateReceiptTotal,
	getAdministrativeCostPerCustomer,
	calculateProfitWithoutTax,
	calculateProfitTaxRate,
	calculateProfitTax,
	calculateBonusByType,
	calculateEmployeeBonuses,
	generateProfitDataItems,
	convertToTableRows,
	groupBonusSettings,
	ProfitDataItem
} from '@/utils/calculations';

export interface UseProfitCalculationParams {
	invoices: Invoice[];
	receipts: Receipt[];
	bonusSettings: GroupBonusSetting[];
	customerCount: number;
	getUserName: (employeeCode: string) => string;
}

export interface ProfitTableRow {
	colTitle1: string;
	colValue1: number;
	colTitle2: string;
	colValue2: number;
}

export interface ProfitCalculationResult {
	// 表格行數據
	tableRows: ProfitTableRow[];
	// 原始計算數據
	calculations: {
		receiptTotal: number;
		invoiceTotal: number;
		administrativeCost: number;
		administrativeCostPerCustomer: number;
		profitWithoutTax: number;
		profitTaxRate: number;
		profitTax: number;
		netProfit: number;
		teamBonus: number;
		employeeBonuses: {
			name: string;
			bonus: number;
			type: number;
			bonusText: string;
		}[];
		companyProfit: number;
	};
	// 數據項目（用於其他用途）
	dataItems: ProfitDataItem[];
}

/**
 * 利潤計算 Hook
 * 將 ProfitTable 的複雜計算邏輯抽離為可復用的 hook
 */
export function useProfitCalculation({
	invoices,
	receipts,
	bonusSettings,
	customerCount,
	getUserName
}: UseProfitCalculationParams): ProfitCalculationResult {
	// 獲取類型名稱的函數
	const getTypeName = useCallback((type: number): string => {
		return BONUS_SETTING_TYPE_NAMES[type]?.toString() || '獎金';
	}, []);

	// 生成團隊獎金顯示文字
	const getTeamBonusText = useCallback((teamBonusSettings: GroupBonusSetting[]): string => {
		if (teamBonusSettings.length === 0) return '0';

		return teamBonusSettings
			.map((s) => (s.bonusType === BONUS_CALCULATION_TYPES.PERCENT ? `${s.bonus}%` : `固定${s.bonus}`))
			.join('+');
	}, []);

	// 分組獎金設置
	const groupedBonusSettings = useMemo(() => {
		return groupBonusSettings(bonusSettings);
	}, [bonusSettings]);

	// 獲取行政費用單價
	const administrativeCostPerCustomer = useMemo(() => {
		return getAdministrativeCostPerCustomer(bonusSettings, BONUS_SETTING_TYPES.ADMINISTRATIVE_EXPENSES, 10);
	}, [bonusSettings]);

	// 主要計算邏輯
	const calculations = useMemo(() => {
		// 1. 基本金額計算
		const invoiceTotal = calculateInvoiceTotalFromInvoices(invoices);
		const receiptTotal = calculateReceiptTotal(receipts);
		const administrativeCost = customerCount * administrativeCostPerCustomer;
		const profitWithoutTax = calculateProfitWithoutTax(receiptTotal, invoiceTotal, administrativeCost);

		// 2. 稅金計算
		const profitTaxRate = calculateProfitTaxRate(
			bonusSettings,
			BONUS_SETTING_TYPES.PROFIT_TAX,
			BONUS_CALCULATION_TYPES.PERCENT
		);
		const profitTax = calculateProfitTax(profitWithoutTax, profitTaxRate);
		const netProfit = profitWithoutTax - profitTax;

		// 3. 獎金計算
		let teamBonus = 0;
		let employeeBonuses: {
			name: string;
			bonus: number;
			type: number;
			bonusText: string;
		}[] = [];
		let companyProfit = netProfit;

		if (netProfit >= 0) {
			// 計算團隊獎金
			teamBonus = calculateBonusByType(
				bonusSettings,
				BONUS_SETTING_TYPES.TEAM_BONUS,
				netProfit,
				BONUS_CALCULATION_TYPES.PERCENT
			);

			// 計算員工個人獎金
			employeeBonuses = calculateEmployeeBonuses(
				bonusSettings,
				netProfit,
				BONUS_CALCULATION_TYPES.PERCENT,
				getUserName,
				getTypeName
			);

			// 計算公司盈餘
			const totalEmployeeBonus = employeeBonuses.reduce((total, item) => total + item.bonus, 0);
			companyProfit = netProfit - teamBonus - totalEmployeeBonus;
		}

		return {
			receiptTotal,
			invoiceTotal,
			administrativeCost,
			administrativeCostPerCustomer,
			profitWithoutTax,
			profitTaxRate,
			profitTax,
			netProfit,
			teamBonus,
			employeeBonuses,
			companyProfit
		};
	}, [invoices, receipts, bonusSettings, customerCount, administrativeCostPerCustomer, getUserName, getTypeName]);

	// 生成顯示數據
	const result = useMemo(() => {
		const {
			receiptTotal,
			invoiceTotal,
			administrativeCost,
			profitWithoutTax,
			profitTaxRate,
			profitTax,
			netProfit,
			teamBonus,
			employeeBonuses,
			companyProfit
		} = calculations;

		// 獲取團隊獎金文字
		const teamBonusSettings = groupedBonusSettings.general[BONUS_SETTING_TYPES.TEAM_BONUS] || [];
		const teamBonusText = getTeamBonusText(teamBonusSettings);

		// 生成數據項目
		const dataItems = generateProfitDataItems(
			receiptTotal,
			invoiceTotal,
			administrativeCost,
			administrativeCostPerCustomer,
			profitWithoutTax,
			profitTaxRate,
			profitTax,
			netProfit,
			teamBonus,
			teamBonusText,
			employeeBonuses,
			companyProfit
		);

		// 轉換為表格行格式
		const tableRows = convertToTableRows(dataItems);

		return {
			tableRows,
			calculations,
			dataItems
		};
	}, [calculations, groupedBonusSettings, getTeamBonusText, administrativeCostPerCustomer]);

	return result;
}

/**
 * 簡化版的利潤計算 Hook（僅返回核心數據）
 */
export function useProfitSummary({
	invoices,
	receipts,
	bonusSettings,
	customerCount
}: Omit<UseProfitCalculationParams, 'getUserName'>) {
	return useMemo(() => {
		const invoiceTotal = calculateInvoiceTotalFromInvoices(invoices);
		const receiptTotal = calculateReceiptTotal(receipts);
		const administrativeCostPerCustomer = getAdministrativeCostPerCustomer(
			bonusSettings,
			BONUS_SETTING_TYPES.ADMINISTRATIVE_EXPENSES,
			10
		);
		const administrativeCost = customerCount * administrativeCostPerCustomer;
		const profitWithoutTax = calculateProfitWithoutTax(receiptTotal, invoiceTotal, administrativeCost);

		const profitTaxRate = calculateProfitTaxRate(
			bonusSettings,
			BONUS_SETTING_TYPES.PROFIT_TAX,
			BONUS_CALCULATION_TYPES.PERCENT
		);
		const profitTax = calculateProfitTax(profitWithoutTax, profitTaxRate);
		const netProfit = profitWithoutTax - profitTax;

		return {
			receiptTotal,
			invoiceTotal,
			administrativeCost,
			profitWithoutTax,
			profitTax,
			netProfit
		};
	}, [invoices, receipts, bonusSettings, customerCount]);
}
