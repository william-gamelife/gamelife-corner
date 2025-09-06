// 團狀態常量
export const GROUP_STATUSES = {
	IN_PROGRESS: 0,
	COMPLETED: 1,
	SPECIAL: 9
} as const;

export type GroupStatus = (typeof GROUP_STATUSES)[keyof typeof GROUP_STATUSES];

// 團狀態名稱映射
export const GROUP_STATUS_NAMES: Record<GroupStatus, string> = {
	[GROUP_STATUSES.IN_PROGRESS]: '進行中',
	[GROUP_STATUSES.COMPLETED]: '已結團',
	[GROUP_STATUSES.SPECIAL]: '特殊團'
};

// 團狀態顏色映射
export const GROUP_STATUS_COLORS: Record<GroupStatus, string> = {
	[GROUP_STATUSES.IN_PROGRESS]: 'success',
	[GROUP_STATUSES.COMPLETED]: 'info',
	[GROUP_STATUSES.SPECIAL]: 'warning'
};

// 團狀態選項
export const GROUP_STATUS_OPTIONS = Object.entries(GROUP_STATUSES).map(([_key, value]) => ({
	value,
	label: GROUP_STATUS_NAMES[value as GroupStatus]
}));
