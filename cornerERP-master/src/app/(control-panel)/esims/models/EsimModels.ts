import _ from 'lodash';
import { Esim } from '../EsimApi';

const EsimModel = (data: Partial<Esim>) => {
	const defaults = {
		esimNumber: '', // 網卡單號
		groupCode: '', // 團號
		orderNumber: '', // 訂單編號
		supplierOrderNumber: '', // 供應商訂單編號
		status: 0, // 狀態 0:待確認 1:已確認 2:錯誤
		productId: '', // 商品Id
		quantity: 1, // 數量
		email: '', // 信箱
		note: '', // 備註
		createdAt: new Date(), // 創建時間
		createdBy: '', // 創建人員
		modifiedAt: new Date(), // 修改時間
		modifiedBy: '' // 修改人員
	};

	const filteredData = _.pick(data, Object.keys(defaults));

	return _.defaults(filteredData, defaults);
};

export default EsimModel;
