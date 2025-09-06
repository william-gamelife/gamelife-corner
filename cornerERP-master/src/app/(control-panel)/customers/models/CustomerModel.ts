import { PartialDeep } from 'type-fest';
import { Customer } from '../CustomerApi';

/**
 * 創建一個新的客戶模型
 */
function CustomerModel(data: PartialDeep<Customer> = {}): Customer {
	return {
		id: data.id || '',
		name: data.name || '',
		birthday: data.birthday || undefined,
		passportRomanization: data.passportRomanization || undefined,
		passportNumber: data.passportNumber || undefined,
		passportValidTo: data.passportValidTo || undefined,
		email: data.email || undefined,
		phone: data.phone || undefined,
		note: data.note || undefined
	};
}

export default CustomerModel;
