import _ from 'lodash';
import { Group } from '../GroupApi';
/**
 * The group model.
 */
const GroupModel = (data: Partial<Group>) => {
	const defaults = {
		returnDate: new Date(), // 默認回程日期
		createdAt: new Date(), // 默認創建日期
		createdBy: '', // 默認創建人員
		departureDate: new Date(), // 默認出發日
		groupCode: '', // 默認團號
		groupName: '', // 默認團名
		travellerIds: [], // 默認旅客編號
		modifiedAt: undefined, // 默認修改日期
		modifiedBy: undefined, // 默認修改人員
		status: 0 // 默認團狀態
	};

	const filteredData = _.pick(data, Object.keys(defaults));

	return _.defaults(filteredData, defaults);
};

export default GroupModel;
