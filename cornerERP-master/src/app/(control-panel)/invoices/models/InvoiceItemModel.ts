import _ from 'lodash';
import { PartialDeep } from 'type-fest';
import { InvoiceItem } from '../InvoiceApi';
import { INVOICE_ITEM_TYPES } from '@/constants/invoiceItemTypes';

const InvoiceItemModel = (data: PartialDeep<InvoiceItem>, isNew = false) => {
	const defaults = {
		id: 0, // 請款項目編號
		invoiceNumber: '', // 請款單號
		createdAt: new Date(), // 創建日期
		createdBy: '', // 創建人
		invoiceType: INVOICE_ITEM_TYPES.OTHER, // 請款類型
		modifiedAt: new Date(), // 修改日期
		modifiedBy: '', // 修改人
		note: '', // 備註
		payFor: '', // 付款給supplier的代號
		price: 0, // 價格
		quantity: 1 // 數量
	};

	const filteredData = _.pick(data, Object.keys(defaults));
	const defaultModel = _.defaults(filteredData, defaults);

	if (isNew) {
		delete defaultModel.id;
	}

	return defaultModel;
};

export default InvoiceItemModel;
