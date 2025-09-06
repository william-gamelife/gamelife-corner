import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserDictionary } from '@/app/(control-panel)/users/store/userDictionarySlice';
import { RootState } from '@/store/store';
import { User } from '@auth/user';
import { PartialDeep } from 'type-fest';

interface UseUserDictionaryReturn {
	dictionary: Record<string, string>;
	users: PartialDeep<User>[];
	loading: boolean;
	error: string | null;
	getUserName: (userId: string) => string;
}

export function useUserDictionary(): UseUserDictionaryReturn {
	const dispatch = useDispatch();
	const userDictionary = useSelector((state: RootState) => state.userDictionary);
	const { dictionary = {}, users = [], loading = false, error = null } = userDictionary || {};

	useEffect(() => {
		if (!userDictionary || (Object.keys(dictionary).length === 0 && !loading && !error)) {
			dispatch(fetchUserDictionary() as any);
		}
	}, [dispatch, dictionary, users, loading, error, userDictionary]);

	const getUserName = (userId: string) => {
		return dictionary[userId] || userId;
	};

	return {
		dictionary,
		users,
		loading,
		error,
		getUserName
	};
}
