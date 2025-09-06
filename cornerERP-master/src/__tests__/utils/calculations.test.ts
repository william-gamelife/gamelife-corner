import {
	calculateInvoiceTotal,
	calculateReceiptTotal,
	calculateAdministrativeCost,
	calculateProfitWithoutTax,
	calculateProfitTax,
	calculateBonus,
	calculateTotalBonus,
	calculateNetProfit,
	formatCurrency,
	isValidAmount,
	safeAdd,
	safeSubtract,
	safeMultiply,
	calculateInvoiceItemPrice,
	groupInvoicesByPayFor,
	mergeInvoicesByNumber,
	splitLargeGroups,
	calculateBillTotalAmount,
	processBillInvoices,
	InvoiceItem,
	Receipt,
	BonusSetting
} from '@/utils/calculations';

describe('商業計算工具函數', () => {
	describe('calculateInvoiceTotal', () => {
		it('應該正確計算發票項目總額', () => {
			const invoiceItems: InvoiceItem[] = [
				{ price: 1000, quantity: 2 },
				{ price: 500, quantity: 3 },
				{ price: 800, quantity: 1 }
			];

			const result = calculateInvoiceTotal(invoiceItems);
			expect(result).toBe(4300); // 2000 + 1500 + 800
		});

		it('應該處理空陣列', () => {
			const result = calculateInvoiceTotal([]);
			expect(result).toBe(0);
		});

		it('應該處理零數量項目', () => {
			const invoiceItems: InvoiceItem[] = [
				{ price: 1000, quantity: 0 },
				{ price: 500, quantity: 2 }
			];

			const result = calculateInvoiceTotal(invoiceItems);
			expect(result).toBe(1000);
		});

		it('應該處理小數價格和數量', () => {
			const invoiceItems: InvoiceItem[] = [{ price: 99.5, quantity: 2.5 }];

			const result = calculateInvoiceTotal(invoiceItems);
			expect(result).toBe(248.75);
		});
	});

	describe('calculateReceiptTotal', () => {
		it('應該正確計算收據總額', () => {
			const receipts: Receipt[] = [{ actualAmount: 5000 }, { actualAmount: 3000 }, { actualAmount: 2000 }];

			const result = calculateReceiptTotal(receipts);
			expect(result).toBe(10000);
		});

		it('應該處理空陣列', () => {
			const result = calculateReceiptTotal([]);
			expect(result).toBe(0);
		});

		it('應該處理 null 或 undefined 金額', () => {
			const receipts = [
				{ actualAmount: 1000 },
				{ actualAmount: null as unknown as number },
				{ actualAmount: undefined as unknown as number },
				{ actualAmount: 2000 }
			];

			const result = calculateReceiptTotal(receipts);
			expect(result).toBe(3000);
		});
	});

	describe('calculateAdministrativeCost', () => {
		it('應該使用預設單價計算行政費用', () => {
			const result = calculateAdministrativeCost(20);
			expect(result).toBe(200); // 20 * 10
		});

		it('應該使用自訂單價計算行政費用', () => {
			const result = calculateAdministrativeCost(15, 12);
			expect(result).toBe(180); // 15 * 12
		});

		it('應該處理零人數', () => {
			const result = calculateAdministrativeCost(0);
			expect(result).toBe(0);
		});
	});

	describe('calculateProfitWithoutTax', () => {
		it('應該正確計算未扣稅利潤', () => {
			const result = calculateProfitWithoutTax(50000, 30000, 1000);
			expect(result).toBe(19000); // 50000 - 30000 - 1000
		});

		it('應該處理負利潤', () => {
			const result = calculateProfitWithoutTax(20000, 30000, 1000);
			expect(result).toBe(-11000);
		});

		it('應該處理零值', () => {
			const result = calculateProfitWithoutTax(30000, 20000, 10000);
			expect(result).toBe(0);
		});
	});

	describe('calculateProfitTax', () => {
		it('應該正確計算營收稅額', () => {
			const result = calculateProfitTax(10000, 20);
			expect(result).toBe(2000); // 10000 * 0.2
		});

		it('應該四捨五入稅額', () => {
			const result = calculateProfitTax(1000, 12.5);
			expect(result).toBe(125); // Math.round(1000 * 0.125)
		});

		it('應該處理負利潤（返回0）', () => {
			const result = calculateProfitTax(-5000, 20);
			expect(result).toBe(0);
		});

		it('應該處理零利潤', () => {
			const result = calculateProfitTax(0, 20);
			expect(result).toBe(0);
		});

		it('應該處理零稅率', () => {
			const result = calculateProfitTax(10000, 0);
			expect(result).toBe(0);
		});
	});

	describe('calculateBonus', () => {
		it('應該計算百分比獎金', () => {
			const bonusSetting: BonusSetting = {
				type: 'sales',
				calculationType: 'percentage',
				value: 10
			};

			const result = calculateBonus(10000, bonusSetting);
			expect(result).toBe(1000); // 10000 * 0.1
		});

		it('應該計算固定金額獎金', () => {
			const bonusSetting: BonusSetting = {
				type: 'op',
				calculationType: 'amount',
				value: 5000
			};

			const result = calculateBonus(10000, bonusSetting);
			expect(result).toBe(5000);
		});

		it('應該計算負百分比獎金', () => {
			const bonusSetting: BonusSetting = {
				type: 'administrative',
				calculationType: 'negativePercentage',
				value: 5
			};

			const result = calculateBonus(10000, bonusSetting);
			expect(result).toBe(-500); // -(10000 * 0.05)
		});

		it('應該計算負固定金額', () => {
			const bonusSetting: BonusSetting = {
				type: 'administrative',
				calculationType: 'negativeAmount',
				value: 1000
			};

			const result = calculateBonus(10000, bonusSetting);
			expect(result).toBe(-1000);
		});

		it('應該處理未知計算類型', () => {
			const bonusSetting = {
				type: 'sales',
				calculationType: 'unknown',
				value: 10
			} as unknown as BonusSetting;

			const result = calculateBonus(10000, bonusSetting);
			expect(result).toBe(0);
		});
	});

	describe('calculateTotalBonus', () => {
		it('應該計算多項獎金總額', () => {
			const bonusSettings: BonusSetting[] = [
				{ type: 'sales', calculationType: 'percentage', value: 10 },
				{ type: 'op', calculationType: 'amount', value: 2000 },
				{ type: 'administrative', calculationType: 'negativeAmount', value: 500 }
			];

			const result = calculateTotalBonus(10000, bonusSettings);
			expect(result).toBe(2500); // 1000 + 2000 - 500
		});

		it('應該處理空獎金設定', () => {
			const result = calculateTotalBonus(10000, []);
			expect(result).toBe(0);
		});
	});

	describe('calculateNetProfit', () => {
		it('應該計算完整的淨利潤', () => {
			const bonusSettings: BonusSetting[] = [
				{ type: 'sales', calculationType: 'percentage', value: 5 },
				{ type: 'op', calculationType: 'amount', value: 1000 }
			];

			const result = calculateNetProfit(
				50000, // 收入
				30000, // 支出
				2000, // 行政費用
				20, // 稅率 20%
				bonusSettings
			);

			expect(result.receiptTotal).toBe(50000);
			expect(result.invoiceTotal).toBe(30000);
			expect(result.administrativeCost).toBe(2000);
			expect(result.profitWithoutTax).toBe(18000); // 50000 - 30000 - 2000
			expect(result.profitTax).toBe(3600); // 18000 * 0.2
			expect(result.totalBonus).toBe(1900); // (18000 * 0.05) + 1000
			expect(result.netProfit).toBe(12500); // 18000 - 3600 - 1900
		});

		it('應該處理虧損情況', () => {
			const result = calculateNetProfit(
				20000, // 收入
				30000, // 支出
				1000, // 行政費用
				20 // 稅率
			);

			expect(result.profitWithoutTax).toBe(-11000);
			expect(result.profitTax).toBe(0); // 虧損不課稅
			expect(result.totalBonus).toBe(0);
			expect(result.netProfit).toBe(-11000);
		});
	});

	describe('formatCurrency', () => {
		it('應該格式化正數為新台幣格式', () => {
			const result = formatCurrency(12345);
			expect(result).toBe('NT$12,345');
		});

		it('應該格式化負數', () => {
			const result = formatCurrency(-5000);
			expect(result).toBe('-NT$5,000');
		});

		it('應該處理零值', () => {
			const result = formatCurrency(0);
			expect(result).toBe('NT$0');
		});

		it('應該處理小數（四捨五入到整數）', () => {
			const result = formatCurrency(1234.56);
			expect(result).toBe('NT$1,235');
		});
	});

	describe('isValidAmount', () => {
		it('應該驗證有效金額', () => {
			expect(isValidAmount(100)).toBe(true);
			expect(isValidAmount(0)).toBe(true);
			expect(isValidAmount(123.45)).toBe(true);
		});

		it('應該拒絕無效金額', () => {
			expect(isValidAmount(-100)).toBe(false);
			expect(isValidAmount(NaN)).toBe(false);
			expect(isValidAmount(Infinity)).toBe(false);
			expect(isValidAmount('100' as unknown as number)).toBe(false);
			expect(isValidAmount(null)).toBe(false);
			expect(isValidAmount(undefined)).toBe(false);
		});
	});

	describe('safeAdd', () => {
		it('應該安全地加法多個數字', () => {
			const result = safeAdd(10.1, 20.2, 30.3);
			expect(result).toBe(60.6);
		});

		it('應該處理浮點數精度問題', () => {
			// JavaScript: 0.1 + 0.2 = 0.30000000000000004
			const result = safeAdd(0.1, 0.2);
			expect(result).toBe(0.3);
		});

		it('應該處理空參數', () => {
			const result = safeAdd();
			expect(result).toBe(0);
		});

		it('應該處理單一參數', () => {
			const result = safeAdd(42.5);
			expect(result).toBe(42.5);
		});
	});

	describe('safeSubtract', () => {
		it('應該安全地減法', () => {
			const result = safeSubtract(100, 30, 20, 10);
			expect(result).toBe(40); // 100 - (30 + 20 + 10)
		});

		it('應該處理浮點數精度問題', () => {
			const result = safeSubtract(1.0, 0.9);
			expect(result).toBe(0.1);
		});

		it('應該處理負結果', () => {
			const result = safeSubtract(10, 20);
			expect(result).toBe(-10);
		});
	});

	describe('safeMultiply', () => {
		it('應該安全地乘法', () => {
			const result = safeMultiply(10.5, 2.5);
			expect(result).toBe(26.25);
		});

		it('應該處理浮點數精度問題', () => {
			// JavaScript 可能有精度問題
			const result = safeMultiply(0.1, 3);
			expect(result).toBe(0.3);
		});

		it('應該處理零值', () => {
			expect(safeMultiply(100, 0)).toBe(0);
			expect(safeMultiply(0, 50)).toBe(0);
		});

		it('應該處理負數', () => {
			const result = safeMultiply(-10, 5);
			expect(result).toBe(-50);
		});
	});

	describe('出納單計算函數', () => {
		describe('calculateInvoiceItemPrice', () => {
			it('應該正確計算一般項目價格', () => {
				const result = calculateInvoiceItemPrice(100, 2, 1, 99);
				expect(result).toBe(200); // 100 * 2
			});

			it('應該正確處理退款項目（取絕對值）', () => {
				const result = calculateInvoiceItemPrice(-100, 2, 99, 99);
				expect(result).toBe(200); // Math.abs(-100 * 2)
			});

			it('應該處理零價格', () => {
				const result = calculateInvoiceItemPrice(0, 5, 1, 99);
				expect(result).toBe(0);
			});

			it('應該處理零數量', () => {
				const result = calculateInvoiceItemPrice(100, 0, 1, 99);
				expect(result).toBe(0);
			});
		});

		describe('groupInvoicesByPayFor', () => {
			it('應該正確按付款對象分組', () => {
				const items = [
					{
						invoiceNumber: 'I001',
						createdBy: 'user1',
						groupName: 'Group1',
						groupCode: 'G001',
						payFor: 'supplier1',
						note: 'Note1',
						price: 1000
					},
					{
						invoiceNumber: 'I002',
						createdBy: 'user2',
						groupName: 'Group2',
						groupCode: 'G002',
						payFor: 'supplier1',
						note: 'Note2',
						price: 2000
					},
					{
						invoiceNumber: 'I003',
						createdBy: 'user3',
						groupName: 'Group3',
						groupCode: 'G003',
						payFor: 'supplier2',
						note: 'Note3',
						price: 1500
					}
				];

				const result = groupInvoicesByPayFor(items);

				expect(Object.keys(result)).toHaveLength(2);
				expect(result['supplier1']).toHaveLength(2);
				expect(result['supplier2']).toHaveLength(1);
			});

			it('應該處理空陣列', () => {
				const result = groupInvoicesByPayFor([]);
				expect(result).toEqual({});
			});
		});

		describe('mergeInvoicesByNumber', () => {
			it('應該正確合併相同發票號碼的項目', () => {
				const items = [
					{
						invoiceNumber: 'I001',
						createdBy: 'user1',
						groupName: 'Group1',
						groupCode: 'G001',
						payFor: 'supplier1',
						note: 'Note1',
						price: 1000
					},
					{
						invoiceNumber: 'I001',
						createdBy: 'user1',
						groupName: 'Group1',
						groupCode: 'G001',
						payFor: 'supplier1',
						note: 'Note2',
						price: 500
					},
					{
						invoiceNumber: 'I002',
						createdBy: 'user2',
						groupName: 'Group2',
						groupCode: 'G002',
						payFor: 'supplier1',
						note: 'Note3',
						price: 2000
					}
				];

				const result = mergeInvoicesByNumber(items);

				expect(result).toHaveLength(2);
				expect(result[0].invoiceNumber).toBe('I001');
				expect(result[0].price).toBe(1500); // 1000 + 500
				expect(result[0].note).toBe('Note1、Note2');
				expect(result[1].invoiceNumber).toBe('I002');
				expect(result[1].price).toBe(2000);
			});
		});

		describe('splitLargeGroups', () => {
			it('應該分割大型群組', () => {
				const invoiceGroups = [
					{
						payFor: 'supplier1',
						invoices: Array(8)
							.fill(null)
							.map((_, i) => ({
								invoiceNumber: `I00${i + 1}`,
								createdBy: 'user1',
								groupName: 'Group1',
								groupCode: 'G001',
								note: `Note${i + 1}`,
								payFor: 'supplier1',
								price: 1000
							})),
						total: 8000
					},
					{
						payFor: 'supplier2',
						invoices: Array(3)
							.fill(null)
							.map((_, i) => ({
								invoiceNumber: `I10${i + 1}`,
								createdBy: 'user2',
								groupName: 'Group2',
								groupCode: 'G002',
								note: `Note${i + 1}`,
								payFor: 'supplier2',
								price: 500
							})),
						total: 1500
					}
				];

				const result = splitLargeGroups(invoiceGroups, 5);

				// supplier1 應該被分割為 2 個群組 (5 + 3)
				// supplier2 保持不變 (3 個項目)
				expect(result).toHaveLength(3);

				// 第一個分割群組
				expect(result[0].payFor).toBe('supplier1');
				expect(result[0].invoices).toHaveLength(5);
				expect(result[0].total).toBe(8000);
				expect(result[0].hiddenTotal).toBeUndefined();

				// 第二個分割群組
				expect(result[1].payFor).toBe('supplier1');
				expect(result[1].invoices).toHaveLength(3);
				expect(result[1].total).toBe(0);
				expect(result[1].hiddenTotal).toBe(true);

				// 未分割的群組
				expect(result[2].payFor).toBe('supplier2');
				expect(result[2].invoices).toHaveLength(3);
				expect(result[2].total).toBe(1500);
			});

			it('應該保持小型群組不變', () => {
				const invoiceGroups = [
					{
						payFor: 'supplier1',
						invoices: Array(3)
							.fill(null)
							.map((_, i) => ({
								invoiceNumber: `I00${i + 1}`,
								createdBy: 'user1',
								groupName: 'Group1',
								groupCode: 'G001',
								note: `Note${i + 1}`,
								payFor: 'supplier1',
								price: 1000
							})),
						total: 3000
					}
				];

				const result = splitLargeGroups(invoiceGroups, 5);
				expect(result).toHaveLength(1);
				expect(result[0]).toEqual(invoiceGroups[0]);
			});
		});

		describe('calculateBillTotalAmount', () => {
			it('應該正確計算總金額', () => {
				const invoiceGroups = [
					{ payFor: 'supplier1', invoices: [], total: 5000 },
					{ payFor: 'supplier2', invoices: [], total: 3000 },
					{ payFor: 'supplier3', invoices: [], total: 2000 }
				];

				const result = calculateBillTotalAmount(invoiceGroups);
				expect(result).toBe(10000);
			});

			it('應該處理空陣列', () => {
				const result = calculateBillTotalAmount([]);
				expect(result).toBe(0);
			});

			it('應該忽略隱藏總計的群組', () => {
				const invoiceGroups = [
					{ payFor: 'supplier1', invoices: [], total: 5000 },
					{ payFor: 'supplier1', invoices: [], total: 0, hiddenTotal: true },
					{ payFor: 'supplier2', invoices: [], total: 3000 }
				];

				const result = calculateBillTotalAmount(invoiceGroups);
				expect(result).toBe(8000); // 5000 + 0 + 3000
			});
		});

		describe('processBillInvoices 整合測試', () => {
			const mockInvoices = [
				{
					invoiceNumber: 'I001',
					createdBy: 'emp001',
					groupName: '台北一日遊',
					groupCode: 'G001',
					invoiceItems: [
						{
							payFor: 'supplier001',
							note: '住宿費',
							invoiceType: 1,
							price: 2000,
							quantity: 2
						},
						{
							payFor: 'customer',
							note: '退款',
							invoiceType: 99, // 退款類型
							price: -500,
							quantity: 1
						}
					]
				},
				{
					invoiceNumber: 'I002',
					createdBy: 'emp002',
					groupName: '高雄二日遊',
					groupCode: 'G002',
					invoiceItems: [
						{
							payFor: 'supplier001',
							note: '交通費',
							invoiceType: 2,
							price: 1500,
							quantity: 1
						}
					]
				}
			];

			const mockGetUserName = (code: string) => `User_${code}`;
			const mockGetSupplierName = (code: string) => `Supplier_${code}`;
			const mockGetInvoiceItemTypeName = (type: number) => `Type_${type}`;
			const mockPaymentTypes = {
				CUSTOMER_REFUND: '客戶退款專用',
				FOREIGN_PAYMENT: '外幣請款專用'
			};

			it('應該正確處理完整的發票數據', () => {
				const result = processBillInvoices(
					mockInvoices as Parameters<typeof processBillInvoices>[0],
					mockGetUserName,
					mockGetSupplierName,
					mockGetInvoiceItemTypeName,
					99, // 退款類型
					mockPaymentTypes
				);

				expect(result).toHaveLength(2); // 2 個付款對象群組

				// 檢查客戶退款群組
				const customerRefundGroup = result.find((group) => group.payFor === '客戶退款專用');
				expect(customerRefundGroup).toBeDefined();
				expect(customerRefundGroup!.total).toBe(500); // Math.abs(-500 * 1)

				// 檢查供應商群組
				const supplierGroup = result.find((group) => group.payFor === 'Supplier_supplier001');
				expect(supplierGroup).toBeDefined();
				expect(supplierGroup!.total).toBe(5500); // (2000 * 2) + (1500 * 1)
				expect(supplierGroup!.invoices).toHaveLength(2); // 2 張發票
			});

			it('應該正確處理空發票數據', () => {
				const result = processBillInvoices(
					[],
					mockGetUserName,
					mockGetSupplierName,
					mockGetInvoiceItemTypeName,
					99,
					mockPaymentTypes
				);

				expect(result).toEqual([]);
			});
		});
	});
});
