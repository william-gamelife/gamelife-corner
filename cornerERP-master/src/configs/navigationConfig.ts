import i18n from '@i18n';
import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';
import en from './navigation-i18n/en';
import tw from './navigation-i18n/tw';
import authRoles from '@auth/authRoles';

i18n.addResourceBundle('en', 'navigation', en);
i18n.addResourceBundle('tw', 'navigation', tw);

/**
 * The navigationConfig object is an array of navigation items for the Fuse application.
 */
const navigationConfig: FuseNavItemType[] = [
	{
		id: 'apps',
		title: 'Applications',
		subtitle: '旅遊團相關區',
		type: 'group',
		icon: 'heroicons-outline:cube',
		translate: 'APPLICATIONS',
		children: [
			{
				id: 'apps.calendar',
				title: '日曆管理',
				type: 'item',
				icon: 'heroicons-outline:calendar',
				url: '/calendar',
				auth: authRoles.user,
				translate: 'CALENDAR_MANAGEMENT'
			},
			{
				id: 'apps.groups',
				title: '旅遊團',
				type: 'item',
				icon: 'heroicons-outline:user-group',
				url: '/groups',
				auth: authRoles.user,
				translate: 'GROUP_MANAGEMENT'
			},
			{
				id: 'apps.orders',
				title: '訂單管理',
				type: 'item',
				icon: 'heroicons-outline:academic-cap',
				url: '/orders',
				auth: authRoles.user,
				translate: 'ORDER_MANAGEMENT'
			},
			{
				id: 'apps.receipts',
				title: '收款單',
				// subtitle: '3 upcoming events',
				type: 'item',
				icon: 'heroicons-outline:currency-dollar',
				url: '/receipts',
				auth: authRoles.user,
				translate: 'RECEIPT_MANAGEMENT'
			},
			{
				id: 'apps.invoices',
				title: '請款單',
				type: 'item',
				icon: 'heroicons-outline:calculator',
				url: '/invoices',
				auth: authRoles.user,
				translate: 'INVOICE_MANAGEMENT'
			},
			{
				id: 'apps.bills',
				title: '出納單',
				type: 'item',
				icon: 'heroicons-outline:credit-card',
				url: '/bills',
				auth: authRoles.accountant,
				translate: 'BILL_MANAGEMENT'
			},
			{
				id: 'apps.suppliers',
				title: '供應商管理',
				type: 'item',
				icon: 'heroicons-outline:swatch',
				url: '/suppliers',
				auth: authRoles.user,
				translate: 'SUPPLIER_MANAGEMENT'
			},
			{
				id: 'apps.esims',
				title: '網卡管理',
				type: 'item',
				icon: 'heroicons-outline:device-phone-mobile',
				url: '/esims',
				auth: authRoles.user,
				translate: 'ESIM_MANAGEMENT'
			},
			{
				id: 'apps.customers',
				title: '顧客管理',
				type: 'item',
				icon: 'heroicons-outline:users',
				url: '/customers',
				auth: authRoles.admin,
				translate: 'CUSTOMER_MANAGEMENT'
			}
		]
	},
	{
		id: 'employees',
		title: '員工管理',
		subtitle: '員工相關區',
		type: 'group',
		auth: authRoles.user,
		icon: 'heroicons-outline:document',
		children: [
			{
				id: 'employees.users',
				title: '員工管理',
				type: 'item',
				icon: 'heroicons-outline:bars-3-bottom-left',
				url: '/users',
				auth: authRoles.user,
				translate: 'EMPLOYEE_MANAGEMENT'
			}
		]
	}
];

export default navigationConfig;
