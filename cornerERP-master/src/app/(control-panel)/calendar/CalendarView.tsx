'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, DateClickArg } from '@fullcalendar/core';
import {
	Card,
	Box,
	CircularProgress,
	Dialog,
	DialogTitle,
	DialogContent,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Typography,
	IconButton,
	ToggleButton,
	ToggleButtonGroup,
	Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import { useGetCalendarEventsQuery } from './CalendarApi';
import { CalendarEvent } from './models/CalendarEventModel';
import { formatDateForAPI } from '@/utils/timezone';

interface CalendarViewProps {
	// 固定為月視圖，移除視圖切換
}

export default function CalendarView({}: CalendarViewProps) {
	const router = useRouter();
	const calendarRef = useRef<FullCalendar>(null);
	const [dateRange, setDateRange] = useState({
		start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
		end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
	});

	// 對話框狀態管理
	const [moreEventsDialog, setMoreEventsDialog] = useState<{
		open: boolean;
		date: string;
		events: any[];
	}>({
		open: false,
		date: '',
		events: []
	});

	// 事件類型過濾狀態
	const [eventFilter, setEventFilter] = useState<'all' | 'groups' | 'birthdays'>('all');

	// 計算事件日期區間長度的函數
	const getEventDuration = (event: any): number => {
		// 生日事件沒有區間，視為 0 天（排在最前面）
		if (!event.end || event.extendedProps?.type === 'birthday') {
			return 0;
		}

		const start = new Date(event.start);
		const end = new Date(event.end);
		const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
		return duration;
	};

	// 事件排序比較函數
	const compareEvents = (a: any, b: any): number => {
		const durationA = getEventDuration(a);
		const durationB = getEventDuration(b);

		// 先按照區間長度排序（短的在前）
		if (durationA !== durationB) {
			return durationA - durationB;
		}

		// 如果區間長度相同，按照開始日期排序
		// 處理不同的日期格式（字串或 Date 物件）
		const getDateString = (date: any): string => {
			if (typeof date === 'string') {
				return date;
			} else if (date instanceof Date) {
				return formatDateForAPI(date) || '';
			} else if (date && typeof date.toISOString === 'function') {
				return formatDateForAPI(date) || '';
			}

			return String(date);
		};

		const startA = getDateString(a.start);
		const startB = getDateString(b.start);

		return startA.localeCompare(startB);
	};

	// 獲取日曆事件
	const { data: allEvents = [], isLoading } = useGetCalendarEventsQuery({
		startDate: format(dateRange.start, 'yyyy-MM-dd'),
		endDate: format(dateRange.end, 'yyyy-MM-dd')
	});

	// 過濾事件函數
	const filterEvents = (events: CalendarEvent[]): CalendarEvent[] => {
		switch (eventFilter) {
			case 'groups':
				return events.filter((event) => event.extendedProps?.type === 'group');
			case 'birthdays':
				return events.filter((event) => event.extendedProps?.type === 'birthday');
			case 'all':
			default:
				return events;
		}
	};

	// 應用過濾的事件
	const events = filterEvents(allEvents);

	// 處理日期點擊 - 導向新增旅遊團頁面
	const handleDateClick = (info: DateClickArg) => {
		const selectedDate = format(info.date, 'yyyy-MM-dd');
		router.push(`/groups/new?departureDate=${selectedDate}`);
	};

	// 處理事件點擊
	const handleEventClick = (info: EventClickArg) => {
		const event = info.event;
		const extendedProps = event.extendedProps as CalendarEvent['extendedProps'];

		if (extendedProps?.type === 'group' && extendedProps.groupCode) {
			// 導向旅遊團編輯頁面
			router.push(`/groups/${extendedProps.groupCode}`);
		} else if (extendedProps?.type === 'birthday' && extendedProps.customerId) {
			// 導向客戶詳細頁面
			router.push(`/customers/${extendedProps.customerId}`);
		}
	};

	// 處理日期範圍變更
	const handleDatesSet = (dateInfo: any) => {
		setDateRange({
			start: dateInfo.start,
			end: dateInfo.end
		});
	};

	// 處理 "更多" 連結點擊
	const handleMoreLinkClick = (info: any) => {
		// 阻止預設的 popover 行為
		info.jsEvent.preventDefault();

		const clickedDate = format(info.date, 'yyyy-MM-dd');

		// 取得當天的所有事件（包括顯示的和隱藏的）
		// 注意：這裡使用 allEvents 而不是 events，因為對話框應該顯示所有相關事件
		const allDayEvents = allEvents.filter((event: CalendarEvent) => {
			// 處理日期格式
			const getDateString = (date: string | Date | undefined): string => {
				if (!date) return '';

				if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}/)) {
					return date.split('T')[0];
				}

				return format(new Date(date), 'yyyy-MM-dd');
			};

			const eventStartDate = getDateString(event.start);

			// 對於生日事件（沒有 end date），只檢查 start date
			if (!event.end || event.extendedProps?.type === 'birthday') {
				return eventStartDate === clickedDate;
			}

			// 對於有結束日期的事件（如旅遊團），檢查日期範圍
			const eventEndDate = getDateString(event.end);
			const isInRange = clickedDate >= eventStartDate && clickedDate <= eventEndDate;

			return isInRange;
		});

		// 排序事件：按照日期區間長度排序
		const sortedEvents = allDayEvents.sort(compareEvents);

		setMoreEventsDialog({
			open: true,
			date: clickedDate,
			events: sortedEvents
		});

		return 'none'; // 告訴 FullCalendar 不要顯示預設的 popover
	};

	// 關閉對話框
	const handleCloseDialog = () => {
		setMoreEventsDialog({
			open: false,
			date: '',
			events: []
		});
	};

	// 處理對話框中的事件點擊
	const handleDialogEventClick = (event: CalendarEvent) => {
		if (event.extendedProps?.type === 'group' && event.extendedProps.groupCode) {
			router.push(`/groups/${event.extendedProps.groupCode}`);
			handleCloseDialog();
		} else if (event.extendedProps?.type === 'birthday' && event.extendedProps.customerId) {
			// 導向客戶詳細頁面
			router.push(`/customers/${event.extendedProps.customerId}`);
			handleCloseDialog();
		}
	};

	// 移除所有視圖切換和 RWD 相關邏輯

	if (isLoading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				height="600px"
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Card sx={{ p: 2 }}>
			{/* 事件類型過濾器 */}
			<Box
				sx={{
					mb: 2,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					flexWrap: 'wrap',
					gap: 2
				}}
			>
				<Typography
					variant="h6"
					component="div"
				>
					日曆管理
				</Typography>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<Typography
						variant="body2"
						color="text.secondary"
					>
						顯示類型：
					</Typography>
					<ToggleButtonGroup
						value={eventFilter}
						exclusive
						onChange={(_, newFilter) => {
							if (newFilter !== null) {
								setEventFilter(newFilter);
							}
						}}
						size="small"
						sx={{
							'& .MuiToggleButton-root': {
								px: 2,
								py: 0.5,
								fontSize: '0.875rem'
							}
						}}
					>
						<ToggleButton value="all">全部顯示</ToggleButton>
						<ToggleButton value="groups">旅遊團</ToggleButton>
						<ToggleButton value="birthdays">生日</ToggleButton>
					</ToggleButtonGroup>
					<Chip
						label={`${events.length} 個事件`}
						size="small"
						variant="outlined"
						color="primary"
					/>
				</Box>
			</Box>

			<FullCalendar
				ref={calendarRef}
				plugins={[dayGridPlugin, interactionPlugin]}
				initialView="dayGridMonth"
				headerToolbar={{
					left: 'prev,next today',
					center: 'title',
					right: ''
				}}
				events={events}
				dateClick={handleDateClick}
				eventClick={handleEventClick}
				datesSet={handleDatesSet}
				locale="zh-tw"
				height="auto"
				dayMaxEvents={3}
				moreLinkClick={handleMoreLinkClick}
				moreLinkText="更多"
				weekends={true}
				eventDisplay="block"
				displayEventTime={false}
				eventClassNames={(arg) => {
					const type = arg.event.extendedProps?.type;
					return type === 'birthday' ? 'birthday-event' : 'group-event';
				}}
				eventOrder={compareEvents}
			/>

			{/* 更多事件對話框 */}
			<Dialog
				open={moreEventsDialog.open}
				onClose={handleCloseDialog}
				maxWidth="sm"
				fullWidth
				PaperProps={{
					sx: {
						borderRadius: 2,
						boxShadow: 24,
						// 確保在小螢幕上適當顯示
						m: { xs: 1, sm: 2 },
						maxHeight: { xs: '90vh', sm: '80vh' }
					}
				}}
			>
				<DialogTitle
					sx={{
						m: 0,
						p: 2,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						borderBottom: 1,
						borderColor: 'divider'
					}}
				>
					<Typography
						variant="h6"
						component="div"
					>
						{moreEventsDialog.date} 的所有活動 ({moreEventsDialog.events.length})
					</Typography>
					<IconButton
						aria-label="close"
						onClick={handleCloseDialog}
						sx={{
							color: (theme) => theme.palette.grey[500]
						}}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent
					dividers
					sx={{
						p: 0,
						maxHeight: { xs: '60vh', sm: '50vh' },
						overflowY: 'auto'
					}}
				>
					<List sx={{ py: 0 }}>
						{moreEventsDialog.events.map((event, index) => (
							<ListItem
								key={index}
								disablePadding
								sx={{
									borderBottom: index < moreEventsDialog.events.length - 1 ? 1 : 0,
									borderColor: 'divider'
								}}
							>
								<ListItemButton
									onClick={() => handleDialogEventClick(event)}
									sx={{
										px: 2,
										py: 1.5
									}}
								>
									<Box
										sx={{
											width: 12,
											height: 12,
											borderRadius: 1,
											backgroundColor: event.backgroundColor || event.color || '#2196F3',
											mr: 2,
											flexShrink: 0
										}}
									/>
									<ListItemText
										primary={event.title}
										primaryTypographyProps={{
											fontSize: '0.95rem',
											fontWeight: 500
										}}
										secondary={(() => {
											if (event.extendedProps?.type === 'birthday') {
												return '生日提醒';
											} else if (event.extendedProps?.type === 'group') {
												// 計算天數
												let dayInfo = '';

												if (event.end) {
													const start = new Date(event.start);
													const end = new Date(event.end);
													const days =
														Math.ceil(
															(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
														) + 1;
													dayInfo = ` • ${days}天`;
												}

												return `團號: ${event.extendedProps.groupCode}${dayInfo}`;
											}

											return '';
										})()}
										secondaryTypographyProps={{
											fontSize: '0.85rem',
											color: 'text.secondary'
										}}
									/>
								</ListItemButton>
							</ListItem>
						))}
					</List>
				</DialogContent>
			</Dialog>

			<style
				jsx
				global
			>{`
				.fc-event {
					cursor: pointer;
					border: none;
					font-size: 12px;
					padding: 4px 6px;
					border-radius: 4px;
					font-weight: 500;
					box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
				}
				.fc-event-title {
					font-weight: 500;
				}
				.group-event {
					opacity: 0.95;
				}
				.group-event:hover {
					opacity: 1;
					transform: translateY(-1px);
					box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
					transition: all 0.2s ease;
				}
				.birthday-event {
					background-color: #ff6b6b !important;
					border-color: #ff6b6b !important;
					color: white !important;
				}
				.fc-day-today {
					background-color: rgba(66, 165, 245, 0.08) !important;
				}
				.fc-daygrid-day:hover {
					background-color: rgba(0, 0, 0, 0.04);
					cursor: pointer;
				}
				.fc-h-event {
					background-color: var(--fc-event-bg-color);
					border-color: var(--fc-event-bg-color);
				}
				.fc-h-event .fc-event-main {
					color: white;
				}
				.fc-daygrid-event {
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
				/* 隱藏原生 popover */
				.fc-popover {
					display: none !important;
				}
				/* 更多連結樣式 */
				.fc-daygrid-more-link {
					color: #1976d2 !important;
					font-weight: 500 !important;
					text-decoration: none !important;
					padding: 2px 6px !important;
					border-radius: 4px !important;
					transition: all 0.2s ease !important;
					display: inline-block !important;
					margin-top: 4px !important;
				}
				.fc-daygrid-more-link:hover {
					background-color: rgba(25, 118, 210, 0.08) !important;
					color: #1565c0 !important;
				}
			`}</style>
		</Card>
	);
}
