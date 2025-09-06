import { createContext, useContext } from 'react';
import { Invoice } from '@/app/(control-panel)/invoices/InvoiceApi';

export const InvoiceDataContext = createContext<{
	invoices: Invoice[];
	isLoading: boolean;
	error: unknown;
	refetch?: () => void;
}>({
	invoices: [],
	isLoading: false,
	error: null,
	refetch: undefined
});

export const useInvoiceData = () => useContext(InvoiceDataContext);
