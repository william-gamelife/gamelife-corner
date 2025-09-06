import _ from 'lodash';
import { Receipt } from '../ReceiptApi';
import { RECEIPT_STATUS } from '@/constants/receiptStatus';

const ReceiptModel = (data: Partial<Receipt>) => {
	const defaults = {
		receiptNumber: '', // 收款單號
		orderNumber: '', // 訂單編號
		receiptDate: new Date(), // 收款日期
		receiptAmount: 0, // 收款金額
		actualAmount: 0, // 實收金額
		receiptType: null, // 付款方式
		receiptAccount: '', // 收款帳號
		email: '', // 收款Email
		payDateline: null, // 付款截止日
		note: '', // 備註
		status: RECEIPT_STATUS.PENDING, // 狀態
		createdAt: new Date(), // 創建日期
		createdBy: '', // 創建人員
		modifiedAt: undefined, // 修改日期
		modifiedBy: undefined // 修改人員
	};

	const filteredData = _.pick(data, Object.keys(defaults));

	return _.defaults(filteredData, defaults);
};

export default ReceiptModel;
