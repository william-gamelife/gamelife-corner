import _ from 'lodash';
import { Order } from '../OrderApi';

const OrderModel = (data: Partial<Order>) => {
	const defaults = {
		orderNumber: '', // 訂單編號
		groupCode: '', // 團號
		contactPerson: '', // 聯絡人
		contactPhone: '', // 聯絡電話
		orderType: '', // 訂單類型
		salesPerson: '', // 業務員
		opId: '', // OP員
		createdAt: new Date(), // 創建日期
		createdBy: '', // 創建人員
		modifiedAt: new Date(), // 修改日期
		modifiedBy: '' // 修改人員
	};

	const filteredData = _.pick(data, Object.keys(defaults));

	return _.defaults(filteredData, defaults);
};

export default OrderModel;
