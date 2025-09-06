import type { Metadata } from 'next';

async function generateMetadata(meta: {
	title: string;
	description: string;
	cardImage: string;
	robots: string;
	favicon: string;
	url: string;
}): Promise<Metadata> {
	return {
		title: meta.title,
		description: meta.description,
		referrer: 'origin-when-cross-origin',
		keywords: [
			'角落旅行社',
			'私人包團',
			'客製化旅遊',
			'泰國旅遊',
			'日本旅遊',
			'越南旅遊',
			'菲律賓旅遊',
			'峇里島旅遊',
			'團體旅遊',
			'自由行'
		],
		authors: [{ name: '角落旅行社', url: 'https://cornertravel.com.tw/' }],
		creator: '角落旅行社',
		publisher: '角落旅行社',
		robots: meta.robots,
		icons: { icon: meta.favicon },
		metadataBase: new URL(meta.url),
		openGraph: {
			url: meta.url,
			title: meta.title,
			description: meta.description,
			images: [meta.cardImage],
			type: 'website',
			siteName: meta.title
		},
		twitter: {
			card: 'summary_large_image',
			site: '@cornertravel',
			creator: '@cornertravel',
			title: meta.title,
			description: meta.description,
			images: [meta.cardImage]
		}
	};
}

export default generateMetadata;
