import { useMemo } from 'react';
import { useGetSuppliersQuery } from '../SupplierApi';

interface UseSupplierDictionaryReturn {
	dictionary: Record<string, string>;
	getSupplierName: (supplierCode: string) => string;
}

export function useSupplierDictionary(): UseSupplierDictionaryReturn {
	const { data: suppliers = [], isLoading } = useGetSuppliersQuery();

	// 創建供應商字典
	const dictionary = useMemo(() => {
		return suppliers.reduce(
			(acc, supplier) => {
				acc[supplier.supplierCode] = supplier.supplierName;
				return acc;
			},
			{} as Record<string, string>
		);
	}, [suppliers]);

	// 獲取供應商名稱的函數
	const getSupplierName = (supplierCode: string) => {
		return dictionary[supplierCode] || supplierCode;
	};

	return {
		dictionary,
		getSupplierName
	};
}
