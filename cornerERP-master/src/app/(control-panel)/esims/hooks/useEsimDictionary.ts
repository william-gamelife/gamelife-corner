import { useMemo } from 'react';
import { useGetEsimsQuery } from '../EsimApi';

interface UseEsimDictionaryReturn {
	dictionary: Record<string, string>;
	getEsimInfo: (esimNumber: string) => string;
}

export function useEsimDictionary(): UseEsimDictionaryReturn {
	const { data: esims = [], isLoading } = useGetEsimsQuery({});

	// 創建網卡字典
	const dictionary = useMemo(() => {
		return esims.reduce(
			(acc, esim) => {
				acc[esim.esimNumber] = `${esim.esimNumber} (${esim.groupCode})`;
				return acc;
			},
			{} as Record<string, string>
		);
	}, [esims]);

	// 獲取網卡資訊的函數
	const getEsimInfo = (esimNumber: string) => {
		return dictionary[esimNumber] || esimNumber;
	};

	return {
		dictionary,
		getEsimInfo
	};
}
