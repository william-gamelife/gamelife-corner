import _ from 'lodash';
import { PartialDeep } from 'type-fest';
import { Invoice } from '../InvoiceApi';
import { INVOICE_STATUS } from '@/constants/invoiceStatus';

const InvoiceModel = (data: PartialDeep<Invoice>) => {
	const defaults = {
		groupCode: '', // 團號
		invoiceNumber: '', // 請款單號
		orderNumber: '', // 訂單編號
		status: INVOICE_STATUS.PENDING, // 狀態
		invoiceDate: new Date(), // 請款日期
		createdAt: new Date(), // 創建日期
		createdBy: '', // 創建人員
		modifiedAt: new Date(), // 修改日期
		modifiedBy: '' // 修改人員
	};

	const filteredData = _.pick(data, Object.keys(defaults));

	return _.defaults(filteredData, defaults);
};

export default InvoiceModel;
