import { User } from '@auth/user';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PartialDeep } from 'type-fest';

type UserDictionary = Record<string, string>;

export interface UserDictionaryState {
	dictionary: UserDictionary;
	users: PartialDeep<User>[];
	loading: boolean;
	error: string | null;
}

const initialState: UserDictionaryState = {
	dictionary: {},
	users: [],
	loading: false,
	error: null
};

export const fetchUserDictionary = createAsyncThunk('userDictionary/fetchAll', async () => {
	const response = await fetch('/api/supabase/users');

	if (response.status !== 200) {
		throw new Error('Failed to fetch user dictionary');
	}

	const data = await response.json();

	const dictionary = data.reduce((acc, user) => {
		acc[user.id] = user.displayName;
		return acc;
	}, {} as UserDictionary);

	return { dictionary, users: data };
});

export const userDictionarySlice = createSlice({
	name: 'userDictionary',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchUserDictionary.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchUserDictionary.fulfilled, (state, action) => {
				state.dictionary = action.payload.dictionary;
				state.users = action.payload.users;
				state.loading = false;
			})
			.addCase(fetchUserDictionary.rejected, (state, action) => {
				state.error = action.error.message;
				state.loading = false;
			});
	}
});
