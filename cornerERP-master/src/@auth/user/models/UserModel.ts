import _ from 'lodash';
import { PartialDeep } from 'type-fest';
import { User } from '@auth/user';

/**
 * Creates a new user object with the specified data.
 */
function UserModel(data?: PartialDeep<User>): User {
	data = data || {};

	return _.defaults(data, {
		id: null,
		roles: null, // guest
		display_name: null,
		photoUrl: '',
		email: '',
		shortcuts: [],
		settings: {},
		loginRedirectUrl: '/'
	}) as User;
}

export default UserModel;
