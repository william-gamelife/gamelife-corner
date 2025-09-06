import _ from 'lodash';
import { PartialDeep } from 'type-fest';

type BatchCreateReceiptType = {
	orderNumber: string;
	receiptDate: Date;
	paymentMethod: string;
	receiptItems: {
		receiptAmount: number;
		receiptAccount: string;
		note: string;
		email: string;
		payDateline: Date;
		paymentName: string;
	}[];
};

const BatchCreateReceiptModel = (data: PartialDeep<BatchCreateReceiptType>) =>
	_.defaults(data || {}, {
		orderNumber: '',
		receiptDate: new Date(),
		receiptType: '',
		receiptItems: []
	});

export default BatchCreateReceiptModel;
