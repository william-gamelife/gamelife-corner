import _ from 'lodash';
import { PartialDeep } from 'type-fest';

import { GroupBonusSetting } from '../GroupBonusSettingApi';
import { BONUS_CALCULATION_TYPES, BONUS_SETTING_TYPES } from '@/constants/bonusSettingTypes';

const GroupBonusSettingModel = (data: PartialDeep<GroupBonusSetting>, isNew = false) => {
	const defaults = {
		id: 0, // 識別碼
		groupCode: '', // 團號
		type: BONUS_SETTING_TYPES.PROFIT_TAX, // 類型 (tax, op_bonus等)
		bonus: 0, // 獎金
		employeeCode: null, // 對應員工編號
		createdBy: null, // 創建人
		createdAt: new Date(), // 創建時間
		modifiedBy: null, // 修改人
		modifiedAt: new Date(), // 修改時間
		bonusType: BONUS_CALCULATION_TYPES.PERCENT // 獎金類型 (percent, dollar等)
	};

	const filteredData = _.pick(data, Object.keys(defaults));

	const defaultModel = _.defaults(filteredData, defaults);

	if (isNew) {
		delete defaultModel.id;
	}

	return defaultModel;
};

export default GroupBonusSettingModel;
