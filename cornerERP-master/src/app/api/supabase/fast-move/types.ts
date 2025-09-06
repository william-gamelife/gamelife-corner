export interface FastMoveProduct {
	wmproductId: string;
	productId: string;
	productName: string;
	productNamelang: string | null;
	productRegion: string;
	productType: number;
	productPrice: number;
	productcPrice: number;
	csight: number;
	leSIM: boolean;
}

export interface FastMoveApiResponse {
	prodList: FastMoveProduct[];
}

export interface FastMoveApiResult {
	success: boolean;
	data?: FastMoveApiResponse;
	message?: string;
}

export interface FastMoveOrderRequest {
	email: string;
	productId: string;
	quantity: number;
	price: number;
	groupCode: string;
	orderNumber: string;
	createdBy: string;
	invoiceNumber: string;
}

export interface FastMoveOrderResponse {
	success: boolean;
	data?: {
		code: number;
		msg: string;
		orderId: string;
	};
	message?: string;
}

export interface FastMoveOrderUsage {
	cid: string;
	useSDate: string;
	useEDate: string;
	totalUsage: string;
	esimStatus: number;
	productType: number;
	itemList: {
		usageDate: string;
		mcc: string;
		code: string;
		zhtw: string;
		enus: string;
		usage: string;
	}[];
	code: number;
	msg: string | null;
}

export interface FastMoveOrderItem {
	iccid: string;
	productName: string;
	redemptionCode: string;
	usage: FastMoveOrderUsage;
}

export interface FastMoveOrderDetail {
	orderId: string;
	orderSN: string;
	orderTime: string;
	itemList: FastMoveOrderItem[];
	code: number;
	msg: string | null;
}

export interface FastMoveOrderDetailRequest {
	orderNumber: string;
}

export interface FastMoveOrderDetailResponse {
	success: boolean;
	data?: FastMoveOrderDetail;
	message?: string;
}
