import _ from 'lodash';
import { Bill } from '../BillApi';
import { BILL_STATUSES } from '@/constants/billStatuses';

const BillModel = (data: Partial<Bill>) => {
	const defaults = {
		billNumber: '',
		billDate: new Date(),
		status: BILL_STATUSES.CONFIRMED,
		invoiceNumbers: [],
		createdAt: new Date(),
		createdBy: '',
		modifiedAt: new Date(),
		modifiedBy: ''
	};

	// 使用 _.pick 過濾出 defaults 的屬性
	const filteredData = _.pick(data, Object.keys(defaults));

	return _.defaults(filteredData, defaults);
};

export default BillModel;
