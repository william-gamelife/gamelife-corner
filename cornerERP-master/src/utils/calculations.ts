/**
 * 商業計算工具函數庫
 * 統一管理所有的商業計算邏輯，確保計算一致性
 */

export interface InvoiceItem {
	price: number;
	quantity: number;
}

export interface Receipt {
	actualAmount: number;
}

export interface BonusSetting {
	type: 'profitTax' | 'op' | 'sales' | 'team' | 'administrative';
	calculationType: 'percentage' | 'amount' | 'negativePercentage' | 'negativeAmount';
	value: number;
}

export interface GroupBonusSetting {
	type: number;
	bonusType: number;
	bonus: number;
	employeeCode?: string;
}

export interface ProfitCalculationParams {
	invoices: InvoiceItem[][];
	receipts: Receipt[];
	bonusSettings: GroupBonusSetting[];
	customerCount: number;
}

export interface ProfitDataItem {
	title: string;
	value: number;
}

export interface ProfitCalculationResult {
	receiptTotal: number;
	invoiceTotal: number;
	administrativeCost: number;
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
	dataItems: ProfitDataItem[];
}

/**
 * 計算發票項目總額
 */
export function calculateInvoiceTotal(invoiceItems: InvoiceItem[]): number {
	return invoiceItems.reduce((total, item) => {
		return total + item.price * item.quantity;
	}, 0);
}

/**
 * 計算收據總額
 */
export function calculateReceiptTotal(receipts: Receipt[]): number {
	return receipts.reduce((total, receipt) => {
		return total + (receipt.actualAmount || 0);
	}, 0);
}

/**
 * 計算行政費用
 */
export function calculateAdministrativeCost(customerCount: number, costPerCustomer = 10): number {
	return customerCount * costPerCustomer;
}

/**
 * 計算未扣稅利潤
 */
export function calculateProfitWithoutTax(
	receiptTotal: number,
	invoiceTotal: number,
	administrativeCost: number
): number {
	return receiptTotal - invoiceTotal - administrativeCost;
}

/**
 * 計算營收稅額
 */
export function calculateProfitTax(profitWithoutTax: number, taxRate: number): number {
	if (profitWithoutTax <= 0) {
		return 0;
	}

	// 使用四捨五入確保金額為整數
	return Math.round(profitWithoutTax * (taxRate / 100));
}

/**
 * 計算獎金
 */
export function calculateBonus(baseAmount: number, bonusSetting: BonusSetting): number {
	const { calculationType, value } = bonusSetting;

	switch (calculationType) {
		case 'percentage':
			return Math.round(baseAmount * (value / 100));
		case 'amount':
			return value;
		case 'negativePercentage':
			return -Math.round(baseAmount * (value / 100));
		case 'negativeAmount':
			return -value;
		default:
			return 0;
	}
}

/**
 * 計算總獎金
 */
export function calculateTotalBonus(profitWithoutTax: number, bonusSettings: BonusSetting[]): number {
	return bonusSettings.reduce((total, setting) => {
		return total + calculateBonus(profitWithoutTax, setting);
	}, 0);
}

/**
 * 計算最終淨利
 */
export function calculateNetProfit(
	receiptTotal: number,
	invoiceTotal: number,
	administrativeCost: number,
	taxRate: number,
	bonusSettings: BonusSetting[] = []
): {
	receiptTotal: number;
	invoiceTotal: number;
	administrativeCost: number;
	profitWithoutTax: number;
	profitTax: number;
	totalBonus: number;
	netProfit: number;
} {
	const profitWithoutTax = calculateProfitWithoutTax(receiptTotal, invoiceTotal, administrativeCost);

	const profitTax = calculateProfitTax(profitWithoutTax, taxRate);
	const totalBonus = calculateTotalBonus(profitWithoutTax, bonusSettings);
	const netProfit = profitWithoutTax - profitTax - totalBonus;

	return {
		receiptTotal,
		invoiceTotal,
		administrativeCost,
		profitWithoutTax,
		profitTax,
		totalBonus,
		netProfit
	};
}

/**
 * 格式化金額為新台幣格式
 */
export function formatCurrency(amount: number): string {
	// 確保在所有環境都使用相同的格式
	const formatted = new Intl.NumberFormat('zh-TW', {
		style: 'currency',
		currency: 'TWD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amount);

	// 確保顯示 NT$ 前綴（在某些環境可能只顯示 $）
	return formatted.replace(/^(-?)?\$/, '$1NT$');
}

/**
 * 檢查金額是否為有效數值
 */
export function isValidAmount(amount: unknown): boolean {
	return typeof amount === 'number' && !isNaN(amount) && isFinite(amount) && amount >= 0;
}

/**
 * 安全的金額加法（避免浮點數精度問題）
 */
export function safeAdd(...amounts: number[]): number {
	// 將所有數字轉為整數（乘以100），計算後再除回來
	const result = amounts.reduce((sum, amount) => {
		return sum + Math.round(amount * 100);
	}, 0);

	return Math.round(result) / 100;
}

/**
 * 安全的金額減法
 */
export function safeSubtract(minuend: number, ...subtrahends: number[]): number {
	const totalSubtrahend = safeAdd(...subtrahends);
	return safeAdd(minuend, -totalSubtrahend);
}

/**
 * 安全的金額乘法
 */
export function safeMultiply(amount: number, multiplier: number): number {
	const result = Math.round(amount * 100) * Math.round(multiplier * 100);
	return Math.round(result) / 10000;
}

/**
 * 計算發票項目總額（支援巢狀結構）
 */
export function calculateInvoiceTotalFromInvoices(invoices: { invoiceItems?: InvoiceItem[] }[]): number {
	return invoices.reduce((total, invoice) => {
		return total + calculateInvoiceTotal(invoice.invoiceItems || []);
	}, 0);
}

/**
 * 從獎金設置中獲取行政費用單價
 */
export function getAdministrativeCostPerCustomer(
	bonusSettings: GroupBonusSetting[],
	administrativeType: number,
	defaultCost = 10
): number {
	const administrativeSettings = bonusSettings.filter((setting) => setting.type === administrativeType);

	if (administrativeSettings.length === 0) {
		return defaultCost;
	}

	return administrativeSettings.reduce((max, setting) => Math.max(max, setting.bonus), 0);
}

/**
 * 分組獎金設置
 */
export function groupBonusSettings(bonusSettings: GroupBonusSetting[]) {
	return bonusSettings.reduce(
		(grouped, setting) => {
			if (setting.employeeCode) {
				grouped.withEmployee.push(setting);
			} else {
				if (!grouped.general[setting.type]) {
					grouped.general[setting.type] = [];
				}

				grouped.general[setting.type].push(setting);
			}

			return grouped;
		},
		{
			withEmployee: [] as GroupBonusSetting[],
			general: {} as Record<number, GroupBonusSetting[]>
		}
	);
}

/**
 * 計算營收稅率
 */
export function calculateProfitTaxRate(
	bonusSettings: GroupBonusSetting[],
	profitTaxType: number,
	percentCalculationType: number
): number {
	const profitTaxSettings = bonusSettings.filter((setting) => setting.type === profitTaxType);

	if (profitTaxSettings.length === 0) {
		return 0;
	}

	const taxSetting = profitTaxSettings[0];
	return taxSetting.bonusType === percentCalculationType ? taxSetting.bonus : 0;
}

/**
 * 計算特定類型的獎金總額
 */
export function calculateBonusByType(
	bonusSettings: GroupBonusSetting[],
	bonusType: number,
	baseAmount: number,
	percentCalculationType: number
): number {
	const settings = bonusSettings.filter((setting) => setting.type === bonusType);

	return settings.reduce((total, setting) => {
		if (setting.bonusType === percentCalculationType) {
			return total + Math.round(baseAmount * (setting.bonus / 100));
		} else {
			return total + setting.bonus;
		}
	}, 0);
}

/**
 * 計算員工個人獎金
 */
export function calculateEmployeeBonuses(
	bonusSettings: GroupBonusSetting[],
	baseAmount: number,
	percentCalculationType: number,
	getUserName: (code: string) => string,
	getTypeName: (type: number) => string
): {
	name: string;
	bonus: number;
	type: number;
	bonusText: string;
}[] {
	const employeeSettings = bonusSettings.filter((setting) => setting.employeeCode);

	return employeeSettings.map((setting) => {
		let bonusAmount = 0;
		const bonusText = setting.bonusType === percentCalculationType ? `${setting.bonus}%` : `${setting.bonus}元`;

		if (setting.bonusType === percentCalculationType) {
			bonusAmount = Math.round(baseAmount * (setting.bonus / 100));
		} else {
			bonusAmount = setting.bonus;
		}

		const typeName = getTypeName(setting.type);

		return {
			name: getUserName(setting.employeeCode!),
			bonus: bonusAmount,
			type: setting.type,
			bonusText: `${typeName}(${bonusText})`
		};
	});
}

/**
 * 生成利潤表格的顯示數據項目
 */
export function generateProfitDataItems(
	receiptTotal: number,
	invoiceTotal: number,
	administrativeCost: number,
	administrativeCostPerCustomer: number,
	profitWithoutTax: number,
	profitTaxRate: number,
	profitTax: number,
	netProfit: number,
	teamBonus: number,
	teamBonusText: string,
	employeeBonuses: { name: string; bonus: number; bonusText: string }[],
	companyProfit: number
): ProfitDataItem[] {
	const dataItems: ProfitDataItem[] = [];

	// 基本財務數據
	dataItems.push({ title: '收款總額 （進項）', value: receiptTotal });
	dataItems.push({ title: '付款總額 （銷項）', value: invoiceTotal });
	dataItems.push({
		title: `行政費用 （${administrativeCostPerCustomer}元/人）`,
		value: administrativeCost
	});
	dataItems.push({ title: '營收總額 （未扣除營收稅額）', value: profitWithoutTax });
	dataItems.push({ title: `營收稅額  （${profitTaxRate}%）`, value: profitTax });
	dataItems.push({ title: '利潤總額 （已扣除營收稅額）', value: netProfit });

	// 獎金計算
	if (netProfit < 0) {
		dataItems.push({ title: '無獎金 (利潤為負)', value: 0 });
	} else {
		// 員工個人獎金
		employeeBonuses.forEach((item) => {
			dataItems.push({
				title: `${item.bonusText} - ${item.name}`,
				value: item.bonus
			});
		});
		dataItems.push({ title: `團隊獎金 （${teamBonusText}）`, value: teamBonus });
		// 公司盈餘
		dataItems.push({ title: '公司盈餘', value: companyProfit });
	}

	return dataItems;
}

/**
 * 將數據項目轉換為表格行格式
 */
export function convertToTableRows(dataItems: ProfitDataItem[]): {
	colTitle1: string;
	colValue1: number;
	colTitle2: string;
	colValue2: number;
}[] {
	const rows = [];

	for (let i = 0; i < dataItems.length; i += 2) {
		const item1 = dataItems[i];
		const item2 = dataItems[i + 1];

		if (item2) {
			rows.push({
				colTitle1: item1.title,
				colValue1: item1.value,
				colTitle2: item2.title,
				colValue2: item2.value
			});
		} else {
			rows.push({
				colTitle1: item1.title,
				colValue1: item1.value,
				colTitle2: '',
				colValue2: 0
			});
		}
	}

	return rows;
}

/**
 * 出納單相關的計算函數
 */

export interface InvoiceItemForBill {
	invoiceNumber: string;
	createdBy: string;
	groupName: string;
	groupCode: string;
	payFor: string;
	note: string;
	price: number;
	invoiceType: number;
	quantity: number;
}

export interface ProcessedInvoiceItem {
	invoiceNumber: string;
	createdBy: string;
	groupName: string;
	groupCode: string;
	payFor: string;
	note: string;
	price: number;
}

export interface InvoiceGroup {
	payFor: string;
	invoices: {
		invoiceNumber: string;
		createdBy: string;
		groupName: string;
		groupCode: string;
		note: string;
		payFor: string;
		price: number;
	}[];
	total: number;
	hiddenTotal?: boolean;
}

/**
 * 計算發票項目價格（處理退款項目）
 */
export function calculateInvoiceItemPrice(
	price: number,
	quantity: number,
	invoiceType: number,
	refundType: number
): number {
	const basePrice = price * quantity;
	return invoiceType === refundType ? Math.abs(basePrice) : basePrice;
}

/**
 * 處理發票項目數據
 */
export function processInvoiceItems(
	invoices: {
		invoiceNumber: string;
		createdBy: string;
		groupName?: string;
		groupCode: string;
		invoiceItems?: InvoiceItemForBill[];
	}[],
	getUserName: (code: string) => string,
	getSupplierName: (code: string) => string,
	getInvoiceItemTypeName: (type: number) => string,
	refundType: number,
	paymentTypes: Record<string, string>
): ProcessedInvoiceItem[] {
	return invoices.flatMap((invoice) =>
		(invoice.invoiceItems || []).map((item) => ({
			invoiceNumber: invoice.invoiceNumber,
			createdBy: getUserName(invoice.createdBy),
			groupName: invoice.groupName || '',
			groupCode: invoice.groupCode,
			payFor:
				item.payFor === 'customer'
					? paymentTypes.CUSTOMER_REFUND
					: item.payFor === 'foreign'
						? paymentTypes.FOREIGN_PAYMENT
						: getSupplierName(item.payFor),
			note: item.note || getInvoiceItemTypeName(item.invoiceType),
			price: calculateInvoiceItemPrice(item.price, item.quantity, item.invoiceType, refundType)
		}))
	);
}

/**
 * 將發票項目按付款對象分組
 */
export function groupInvoicesByPayFor(processedItems: ProcessedInvoiceItem[]): Record<string, ProcessedInvoiceItem[]> {
	return processedItems.reduce(
		(groups, item) => {
			if (!groups[item.payFor]) {
				groups[item.payFor] = [];
			}

			groups[item.payFor].push(item);
			return groups;
		},
		{} as Record<string, ProcessedInvoiceItem[]>
	);
}

/**
 * 將同一付款對象的項目按發票號碼合併
 */
export function mergeInvoicesByNumber(groupedItems: ProcessedInvoiceItem[]): {
	invoiceNumber: string;
	createdBy: string;
	groupName: string;
	groupCode: string;
	note: string;
	payFor: string;
	price: number;
}[] {
	const grouped = groupedItems.reduce(
		(acc, item) => {
			if (!acc[item.invoiceNumber]) {
				acc[item.invoiceNumber] = [];
			}

			acc[item.invoiceNumber].push(item);
			return acc;
		},
		{} as Record<string, ProcessedInvoiceItem[]>
	);

	return Object.keys(grouped).map((invoiceNumber) => {
		const items = grouped[invoiceNumber];
		const firstItem = items[0];

		return {
			invoiceNumber,
			createdBy: firstItem.createdBy,
			groupName: firstItem.groupName,
			groupCode: firstItem.groupCode,
			note: items.map((item) => item.note).join('、'),
			payFor: firstItem.payFor,
			price: items.reduce((sum, item) => sum + item.price, 0)
		};
	});
}

/**
 * 將大型群組分割為較小的群組
 */
export function splitLargeGroups(invoiceGroups: InvoiceGroup[], maxGroupSize = 5): InvoiceGroup[] {
	const result: InvoiceGroup[] = [];

	invoiceGroups.forEach((group) => {
		if (group.invoices.length <= maxGroupSize) {
			result.push(group);
		} else {
			// 將大群組分割
			const chunks = [];
			for (let i = 0; i < group.invoices.length; i += maxGroupSize) {
				chunks.push(group.invoices.slice(i, i + maxGroupSize));
			}

			chunks.forEach((chunk, index) => {
				const newGroup: InvoiceGroup = {
					...group,
					invoices: chunk,
					total: index === 0 ? group.total : 0
				};

				if (index !== 0) {
					newGroup.hiddenTotal = true;
				}

				result.push(newGroup);
			});
		}
	});

	return result;
}

/**
 * 完整的出納單發票處理流程
 */
export function processBillInvoices(
	invoices: {
		invoiceNumber: string;
		createdBy: string;
		groupName?: string;
		groupCode: string;
		invoiceItems?: InvoiceItemForBill[];
	}[],
	getUserName: (code: string) => string,
	getSupplierName: (code: string) => string,
	getInvoiceItemTypeName: (type: number) => string,
	refundType: number,
	paymentTypes: Record<string, string>,
	maxGroupSize = 5
): InvoiceGroup[] {
	// 1. 處理發票項目
	const processedItems = processInvoiceItems(
		invoices,
		getUserName,
		getSupplierName,
		getInvoiceItemTypeName,
		refundType,
		paymentTypes
	);

	// 2. 按付款對象分組
	const groupedByPayFor = groupInvoicesByPayFor(processedItems);

	// 3. 建立發票群組
	const invoiceGroups = Object.keys(groupedByPayFor).map((payFor) => {
		const mergedInvoices = mergeInvoicesByNumber(groupedByPayFor[payFor]);

		return {
			payFor,
			invoices: mergedInvoices,
			total: mergedInvoices.reduce((sum, invoice) => sum + invoice.price, 0)
		};
	});

	// 4. 分割大型群組
	const splitGroups = splitLargeGroups(invoiceGroups, maxGroupSize);

	// 5. 按付款對象排序
	splitGroups.sort((a, b) => a.payFor.localeCompare(b.payFor));

	return splitGroups;
}

/**
 * 計算出納單總金額
 */
export function calculateBillTotalAmount(invoiceGroups: InvoiceGroup[]): number {
	return invoiceGroups.reduce((sum, group) => sum + group.total, 0);
}
