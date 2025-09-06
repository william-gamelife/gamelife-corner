/**
 * The type definition for a user object.
 */
export type User = {
	id: string;
	roles: string[] | string | null;
	displayName: string;
	employeeName?: string; // 員工姓名
	idNumber?: string; // 身份證號
	birthday?: string; // 生日
	note?: string; // 備註
	photoUrl?: string;
	startOfDuty?: string;
	endOfDuty?: string;
	password?: string;
	email?: string;
	title?: string;
	createdAt?: string;
	modifiedAt?: string;
	shortcuts?: string[];
	settings?: Record<string, unknown>;
	loginRedirectUrl?: string; // The URL to redirect to after login.
	user?: User; // For nested user references
	updateUser?: (user: Partial<User>) => void;
	updateUserSettings?: (settings: Record<string, unknown>) => void;
	[key: string]: unknown; // index signature for flexibility
};

export type Login = {
	id: string;
	password: string;
};
