export interface Customer {
	id: string; // 顧客身份證號
	name: string; // 顧客姓名
	birthday?: Date; // 生日
	email?: string; // 電子郵件
	phone?: string; // 電話
	note?: string; // 備註
}

export interface CustomerInput extends Omit<Customer, 'birthday'> {
	birthday?: string; // 前端傳入的生日格式為字串 (YYYY-MM-DD)
}
