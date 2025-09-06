import _ from 'lodash';
import { PartialDeep } from 'type-fest';
import { User } from '@auth/user';

const UserModel = (data: PartialDeep<User>, isNew = false) => {
	const defaults = {
		id: '', // 使用者ID
		displayName: '', // 顯示名稱
		employeeName: '', // 員工姓名
		title: '', // 職稱
		idNumber: '', // 身份證號
		birthday: null, // 生日
		startOfDuty: null, // 到職日期
		endOfDuty: null, // 離職日期
		password: '', // 密碼
		roles: [], // 角色
		note: '', // 備註
		createdAt: new Date(), // 創建日期
		modifiedAt: new Date(), // 更新日期
		photoUrl: '' // 照片URL
	};

	const filteredData = _.pick(data, Object.keys(defaults));

	const defaultModel = _.defaults(filteredData, defaults);

	if (isNew) {
		delete defaultModel.id;
	}

	return defaultModel;
};

export default UserModel;
