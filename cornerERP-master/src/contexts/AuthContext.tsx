'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabaseAuth } from '@/lib/auth/supabaseAuth';
import { User } from '@auth/user';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
	user: User | null;
	session: Session | null;
	loading: boolean;
	signIn: (id: string, password: string) => Promise<{ success: boolean; error?: string }>;
	signOut: () => Promise<void>;
	refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// 初始化時檢查使用者狀態
		const initializeAuth = async () => {
			const result = await supabaseAuth.getCurrentUser();

			if (result.success && 'user' in result && 'session' in result) {
				setUser(result.user!);
				setSession(result.session!);
			}

			setLoading(false);
		};

		initializeAuth();

		// 監聽認證狀態變化
		const {
			data: { subscription }
		} = supabaseAuth.onAuthStateChange((session, user) => {
			setSession(session);
			setUser(user || null);
			setLoading(false);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	const signIn = async (id: string, password: string) => {
		setLoading(true);
		const result = await supabaseAuth.signIn(id, password);

		if (result.success) {
			setUser(result.user!);
			setSession(result.session!);
		}

		setLoading(false);
		return { success: result.success, error: result.error };
	};

	const signOut = async () => {
		setLoading(true);
		await supabaseAuth.signOut();
		setUser(null);
		setSession(null);
		setLoading(false);
	};

	const refreshSession = async () => {
		const result = await supabaseAuth.refreshSession();

		if (result.success && result.session) {
			setSession(result.session);
		}
	};

	const value: AuthContextType = {
		user,
		session,
		loading,
		signIn,
		signOut,
		refreshSession
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}

	return context;
}
