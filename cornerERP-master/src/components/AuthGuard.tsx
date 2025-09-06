'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';
import FuseSplashScreen from '@/@fuse/core/FuseSplashScreen';

interface AuthGuardProps {
	children: ReactNode;
	requireAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
	const { user, loading } = useAuth();

	// 載入中顯示啟動畫面
	if (loading) {
		return <FuseSplashScreen />;
	}

	// 如果需要認證但沒有用戶，middleware 會處理重定向
	// 這裡只需要顯示載入畫面
	if (requireAuth && !user) {
		return <FuseSplashScreen />;
	}

	return <>{children}</>;
}
