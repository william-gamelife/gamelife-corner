'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const LAST_VISITED_PATH_KEY = 'lastVisitedPath';

/**
 * Hook to track and restore the last visited path
 */
export function useLastVisitedPath() {
	const pathname = usePathname();

	// Save current path to localStorage whenever it changes
	useEffect(() => {
		// Don't save auth-related paths
		if (!pathname.includes('sign-in') && !pathname.includes('sign-out') && pathname !== '/') {
			localStorage.setItem(LAST_VISITED_PATH_KEY, pathname);
		}
	}, [pathname]);

	return {
		getLastVisitedPath: () => localStorage.getItem(LAST_VISITED_PATH_KEY) || '/groups',
		clearLastVisitedPath: () => localStorage.removeItem(LAST_VISITED_PATH_KEY)
	};
}
