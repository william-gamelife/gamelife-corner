import clsx from 'clsx';
import 'src/styles/splash-screen.css';
import 'src/styles/index.css';
import { AuthProvider } from '@/contexts/AuthContext';
import generateMetadata from '../utils/generateMetadata';
import App from './App';

// eslint-disable-next-line react-refresh/only-export-components
export const metadata = await generateMetadata({
	title: '角落旅行社-管理平台',
	description:
		'我們是一個創新旅遊品牌，專營私人包團與客製化旅遊服務，致力於為每位旅客打造獨一無二的旅行體驗！目前可安排的國家包括泰國、日本、越南、菲律賓及峇里島',
	cardImage: '/corner.jpg',
	robots: 'follow, index',
	favicon: '/favicon.ico',
	url: 'https://react-material.fusetheme.com'
});

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="zh-TW">
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, shrink-to-fit=no"
				/>
				<meta
					name="theme-color"
					content="#000000"
				/>
				<base href="/" />
				{/*
					manifest.json provides metadata used when your web app is added to the
					homescreen on Android. See https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/
				*/}
				<link
					rel="manifest"
					href="/manifest.json"
				/>
				<link
					rel="shortcut icon"
					href="/favicon.ico"
				/>

				<link
					href="/assets/fonts/material-design-icons/MaterialIconsOutlined.css"
					rel="stylesheet"
				/>
				<link
					href="/assets/fonts/inter/inter.css"
					rel="stylesheet"
				/>
				<link
					href="/assets/fonts/meteocons/style.css"
					rel="stylesheet"
				/>
				<link
					href="/assets/styles/prism.css"
					rel="stylesheet"
				/>
				<noscript id="emotion-insertion-point" />
			</head>
			<body
				id="root"
				className={clsx('loading')}
			>
				<AuthProvider>
					<App>{children}</App>
				</AuthProvider>
			</body>
		</html>
	);
}
