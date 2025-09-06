'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function MainPage() {
	const router = useRouter();

	useEffect(() => {
		// Get the last visited path from localStorage
		const lastVisitedPath = localStorage.getItem('lastVisitedPath') || '/groups';
		router.push(lastVisitedPath);
	}, [router]);

	// Show loading while redirecting
	return (
		<div className="flex items-center justify-center h-screen">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
				<p className="mt-4 text-gray-600">正在載入...</p>
			</div>
		</div>
	);
}

export default MainPage;
