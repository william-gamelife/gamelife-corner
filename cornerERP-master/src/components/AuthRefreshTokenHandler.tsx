'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef } from 'react';

/**
 * 用於客戶端定期刷新token的組件
 * 放置在需要長時間保持登入狀態的頁面上
 */
export default function AuthRefreshTokenHandler() {
	const { session, refreshSession } = useAuth();
	const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		// 清理之前的計時器
		if (refreshTimerRef.current) {
			clearInterval(refreshTimerRef.current);
		}

		// 如果有session才設置刷新
		if (session?.refresh_token) {
			// 每50分鐘刷新一次token (比token過期時間更早觸發)
			refreshTimerRef.current = setInterval(
				async () => {
					try {
						await refreshSession();
					} catch (error) {
						console.error('自動刷新token失敗:', error);
					}
				},
				50 * 60 * 1000
			); // 50分鐘
		}

		// 組件卸載時清理
		return () => {
			if (refreshTimerRef.current) {
				clearInterval(refreshTimerRef.current);
			}
		};
	}, [session, refreshSession]);

	// 這是一個純功能性組件，不需要渲染任何UI
	return null;
}
