import { useEffect, useState } from 'react';

/**
 * 登入頁面標語動畫組件
 * 實現打字機效果，輪流顯示不同的標語文字
 */
function Slogan() {
	const slogans = [
		'角落旅行社｜探索每一寸美好，重新定義你的旅程', // 強調旅行社名稱，並呼籲重新出發
		'從城市到秘境，角落帶你發現世界新體驗', // 強調多元化旅遊體驗
		'專屬你的旅行提案，角落為你量身打造', // 強調客制化服務
		'與角落同行，開啟無限可能的旅途中', // 強調陪伴與可能性
		'讓世界成為你的角落，盡情探索無界', // 強調旅行的自由與廣闊
		'角落旅行社｜你的旅程，我們的使命', // 強調團隊責任感與專業性
		'從夢想出發，角落帶你抵達心之所向', // 強調夢想與實現
		'與角落一起，重新擁抱旅行的美好', // 呼應疫情後渴望旅行的心理
		'走進世界的每個角落，發現不一樣的自己' // 強調旅行與自我成長的連結
	];

	// 隨機打亂標語順序
	const shuffleArray = (array) => {
		return array.sort(() => Math.random() - 0.5);
	};

	const [index, setIndex] = useState(0);
	const [front, setFront] = useState(true);
	const [descriptions] = useState(shuffleArray(slogans));
	const [description, setDescription] = useState('');
	const [time, setTime] = useState(2000);

	useEffect(() => {
		const timer = setTimeout(() => {
			const len = description.length;

			// 當文字完全顯示時，停留一段時間後開始刪除
			if (front && description === descriptions[index]) {
				setTime(3000);
				setFront((prevFront) => !prevFront);
				return;
			}
			// 當文字完全刪除時，切換到下一個標語
			else if (len === 0 && !front) {
				setIndex((prevIndex) => (prevIndex + 1 >= descriptions.length ? 0 : prevIndex + 1));
				setFront(true);
				return;
			}

			// 處理文字顯示
			if (front) {
				setDescription((prevValue) => prevValue + (descriptions[index][len] || ''));
				setTime(description.length === descriptions[index].length ? 1500 : 100);
			}
			// 處理文字刪除
			else {
				setDescription((prevDescription) => prevDescription.slice(0, -1));
				setTime(description.length === 0 ? 1000 : 80);
			}
		}, time);

		return () => {
			clearTimeout(timer);
		};
	}, [description, front, index, descriptions, time]);

	return (
		<div className="z-10 relative w-full max-w-2xl">
			<div className="text-7xl font-bold leading-none text-gray-100">
				<div>角落旅行社管理平台</div>
			</div>
			<p className="mt-24 text-gray-300 max-w-xl text-4xl font-extralight tracking-[0.75rem] pt-5 w-full relative">
				<span>{description}</span>
				<span className="animate-bounce inline-block">|</span>
			</p>
		</div>
	);
}

export default Slogan;
