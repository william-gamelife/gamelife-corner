import apiFetch from '@/utils/apiFetch';
import { Login } from './user';
import { PartialDeep } from 'type-fest';

/**
 * Get user by id
 */
export async function authGetDbUser(userId: string): Promise<Response> {
	return apiFetch(`/api/supabase/users/${userId}?withSession=true`);
}

export async function authGetDbUserWithOutSession(userId: string): Promise<Response> {
	return apiFetch(`/api/supabase/users/${userId}?withSession=false`);
}

export async function authRefreshToken() {
	return apiFetch('/api/auth/refresh-token', {
		method: 'POST'
	});
}

/**
 * 確認帳號密碼正確
 */
export async function authCheckDbUser(login: PartialDeep<Login>) {
	return apiFetch('/api/supabase/users', {
		method: 'POST',
		body: JSON.stringify(login)
	});
}
