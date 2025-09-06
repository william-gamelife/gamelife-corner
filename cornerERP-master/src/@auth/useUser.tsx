import { useMemo } from 'react';
import { User } from '@auth/user';
import { useAuth } from '@/contexts/AuthContext';

type useUser = {
	data: User | null;
	isGuest: boolean;
	isLoading: boolean;
	signOut: () => Promise<void>;
	updateUser?: (user: Partial<User>) => void;
	updateUserSettings?: (settings: Record<string, unknown>) => void;
	user?: User | null;
};

function useUser(): useUser {
	const { user, signOut, loading } = useAuth();
	const isGuest = useMemo(() => !user?.roles || user?.roles?.length === 0, [user]);

	return {
		data: user,
		isGuest,
		isLoading: loading,
		signOut,
		user: user,
		updateUser: (updatedUser: Partial<User>) => {
			// TODO: Implement user update logic
			// console.log('updateUser called with:', updatedUser);
		},
		updateUserSettings: (settings: Record<string, unknown>) => {
			// TODO: Implement user settings update logic
			// console.log('updateUserSettings called with:', settings);
		}
	};
}

export default useUser;
