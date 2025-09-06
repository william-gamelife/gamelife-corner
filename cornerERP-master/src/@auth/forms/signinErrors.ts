const signinErrors: Record<string, string> = {
	default: '無法登入，請稍後再試。',
	Signin: '請嘗試使用其他帳號登入。',
	OAuthSignin: '請嘗試使用其他帳號登入。',
	OAuthCallbackError: '請嘗試使用其他帳號登入。',
	OAuthCreateAccount: '請嘗試使用其他帳號登入。',
	EmailCreateAccount: '請嘗試使用其他帳號登入。',
	Callback: '請嘗試使用其他帳號登入。',
	OAuthAccountNotLinked: '為確認您的身份，請使用原始註冊的帳號登入。',
	EmailSignin: '電子郵件發送失敗，請稍後再試。',
	CredentialsSignin: '登入失敗，請確認您輸入的資料是否正確。',
	SessionRequired: '請先登入以存取此頁面。'
};

export default signinErrors;
