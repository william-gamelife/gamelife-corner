import _ from 'lodash';
import { Supplier } from '../SupplierApi';

const SupplierModel = (data: Partial<Supplier>) => {
	const defaults = {
		supplierCode: '', // 供應商編號
		supplierName: '', // 供應商名稱
		supplierType: '', // 供應商類型
		accountCode: '', // 付款方式
		accountName: '', // 收款帳號
		bankCode: '', // 銀行代碼
		isQuoted: false, // 是否報價
		createdAt: new Date(), // 創建日期
		createdBy: '', // 創建人員
		modifiedAt: new Date(), // 修改日期
		modifiedBy: '' // 修改人員
	};

	const filteredData = _.pick(data, Object.keys(defaults));

	return _.defaults(filteredData, defaults);
};

export default SupplierModel;
