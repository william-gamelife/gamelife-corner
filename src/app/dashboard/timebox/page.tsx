'use client'

import { useState, useEffect, useCallback } from 'react'
import { authManager } from '@/lib/auth'
import { TimeboxEntry, TimeboxActivity } from '@/lib/types'
import { TimeboxAPI } from '@/lib/api/TimeboxAPI'

interface TimerState {
  isRunning: boolean
  currentTime: number
  totalTime: number
  activityId: string | null
  startTime: number | null
}

export default function TimeboxPage() {
  const [user, setUser] = useState<any>(null)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date())
  const [timeboxData, setTimeboxData] = useState<{ [key: string]: TimeboxEntry }>({})
  const [activityTypes, setActivityTypes] = useState<TimeboxActivity[]>([])
  const [timerState, setTimerState] = useState<TimerState | null>(null)
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<Set<string>>(new Set())
  const [timeUnit, setTimeUnit] = useState(30)
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showTimerPanel, setShowTimerPanel] = useState(false)
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())
  // 移除多選模式狀態 - Ctrl功能永久啟用
  const [previewSlots, setPreviewSlots] = useState<Set<string>>(new Set())
  const [showCtrlHint, setShowCtrlHint] = useState(false)
  
  // 拖拽選擇功能
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<string | null>(null)
  const [dragSelection, setDragSelection] = useState<Set<string>>(new Set())
  const [showActivitySelector, setShowActivitySelector] = useState(false)
  
  // Popover和記錄功能
  const [showPopover, setShowPopover] = useState(false)
  const [popoverTarget, setPopoverTarget] = useState<string | null>(null)
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 })
  const [showTimingRecord, setShowTimingRecord] = useState(false)
  const [showWorkoutRecord, setShowWorkoutRecord] = useState(false)
  const [timingMinutes, setTimingMinutes] = useState<number>(0)
  const [workoutData, setWorkoutData] = useState({ exercise: '', reps: 0, sets: 0 })
  
  // 新增活動相關狀態
  const [newActivityName, setNewActivityName] = useState('')
  const [newActivityColor, setNewActivityColor] = useState('#3b82f6')
  const [newActivityCategory, setNewActivityCategory] = useState<'timing' | 'workout'>('timing')
  
  // 活動右鍵菜單相關狀態
  const [showActivityContextMenu, setShowActivityContextMenu] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const [selectedActivityForEdit, setSelectedActivityForEdit] = useState<string | null>(null)

  // 初始化當前週
  const initCurrentWeek = useCallback(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    // 修正為週一開始
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    const weekStart = new Date(today.setDate(diff))
    weekStart.setHours(0, 0, 0, 0)
    setCurrentWeekStart(weekStart)
  }, [])

  // 載入資料
  const loadData = useCallback(async () => {
    try {
      if (!user?.id) return
      
      const weekStart = currentWeekStart.toISOString()
      const entries = await TimeboxAPI.getEntries(user.id, weekStart)
      const activities = await TimeboxAPI.getActivities(user.id)
      
      // 將 entries 轉換為 timeboxData 格式
      const timeboxDataMap: { [key: string]: TimeboxEntry } = {}
      entries.forEach(entry => {
        const key = `${entry.day}_${entry.hour}`
        timeboxDataMap[key] = entry
      })
      
      setTimeboxData(timeboxDataMap)
      setActivityTypes(activities.length > 0 ? activities : getDefaultActivityTypes())
      setTimerState(null) // Timer state 暫時不使用 API 儲存
    } catch (error) {
      console.error('載入資料失敗:', error)
      setTimeboxData({})
      setActivityTypes(getDefaultActivityTypes())
    }
  }, [user])

  // 儲存資料
  const saveData = useCallback(async () => {
    if (!user) return
    
    try {
      // 注意：由於新架構，這裡應該在實際操作時使用個別的 create/update/delete
      // 這個函數主要用於批量同步，實際使用時建議改為個別操作
      console.log('saveData 函數已更新為使用 TimeboxAPI，建議改用個別操作')
    } catch (error) {
      console.error('儲存失敗:', error)
    }
  }, [user, timeboxData, activityTypes, timerState])

  // 預設活動類型 - 空陣列，全部由用戶自定義
  const getDefaultActivityTypes = (): TimeboxActivity[] => []

  // 獲取週日期範圍
  const getWeekRange = () => {
    const start = new Date(currentWeekStart)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    
    return {
      start: start.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }),
      end: end.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })
    }
  }

  // 週導航
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeekStart)
    newWeek.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeekStart(newWeek)
  }

  const goToToday = () => {
    initCurrentWeek()
  }

  // 生成時間格子 - ZOOM縮放概念：30分鐘ZOOM IN，60分鐘ZOOM OUT
  const generateTimeGrid = () => {
    const days = ['週一', '週二', '週三', '週四', '週五', '週六', '週日']
    
    // ZOOM顯示邏輯：純視覺縮放，數據基準永遠30分鐘
    const displaySlots = []
    for (let hour = 6; hour <= 22; hour++) {
      if (timeUnit === 30) {
        // ZOOM IN (30分鐘模式)：顯示所有30分鐘格線 - 詳細編輯
        displaySlots.push({
          hour,
          minute: 0,
          displayTime: `${hour.toString().padStart(2, '0')}:00`
        })
        if (hour < 22) { // 22:30不顯示
          displaySlots.push({
            hour,
            minute: 30,
            displayTime: `${hour.toString().padStart(2, '0')}:30`
          })
        }
      } else {
        // ZOOM OUT (60分鐘模式)：只顯示小時格線 - 快速佈局
        displaySlots.push({
          hour,
          minute: 0,
          displayTime: `${hour.toString().padStart(2, '0')}:00`
        })
      }
    }
    
    return { days, timeSlots: displaySlots }
  }

  // 獲取時間槽ID
  const getSlotId = (day: number, hour: number, minute: number = 0) => {
    const date = new Date(currentWeekStart)
    date.setDate(currentWeekStart.getDate() + day)
    return `${date.toISOString().split('T')[0]}_${hour}_${minute}`
  }

  // 獲取時間槽資料
  const getSlotData = (slotId: string) => {
    return timeboxData[slotId] || null
  }

  // 設定時間槽活動
  const setSlotActivity = (slotId: string, activityId: string | null) => {
    if (activityId) {
      const activity = activityTypes.find(a => a.id === activityId)
      if (activity) {
        const [dateStr, hourStr, minuteStr] = slotId.split('_')
        const newEntry: TimeboxEntry = {
          id: slotId,
          day: parseInt(hourStr),
          hour: parseInt(hourStr),
          activity: activity.name,
          category: activity.category,
          color: activity.color,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setTimeboxData(prev => ({ ...prev, [slotId]: newEntry }))
      }
    } else {
      setTimeboxData(prev => {
        const newData = { ...prev }
        delete newData[slotId]
        return newData
      })
    }
  }

  // 計算拖拽選擇範圍 - 固定30分鐘步進
  const calculateDragSelection = (startSlot: string, endSlot: string): Set<string> => {
    const selection = new Set<string>()
    
    if (!startSlot || !endSlot) return selection
    
    // 解析時間槽ID格式：YYYY-MM-DD_hour_minute
    const [startDateStr, startHourStr, startMinuteStr] = startSlot.split('_')
    const [endDateStr, endHourStr, endMinuteStr] = endSlot.split('_')
    
    // 確保同一天
    if (startDateStr !== endDateStr) return selection
    
    const startTime = parseInt(startHourStr) * 60 + parseInt(startMinuteStr)
    const endTime = parseInt(endHourStr) * 60 + parseInt(endMinuteStr)
    
    const minTime = Math.min(startTime, endTime)
    const maxTime = Math.max(startTime, endTime)
    
    // 固定使用30分鐘步進，不論顯示單位
    for (let time = minTime; time <= maxTime; time += 30) {
      const h = Math.floor(time / 60)
      const m = time % 60
      if (h >= 6 && h <= 22) { // 限制在工作時間範圍
        const slotId = `${startDateStr}_${h}_${m}`
        selection.add(slotId)
      }
    }
    
    return selection
  }

  // 獲取連續時間槽 - 固定30分鐘步進
  const getMergedContinuousSlots = (clickedSlot: string): Set<string> => {
    const [dateStr, hourStr, minuteStr] = clickedSlot.split('_')
    const clickedTime = parseInt(hourStr) * 60 + parseInt(minuteStr)
    
    const mergedSlots = new Set([clickedSlot])
    
    // 向前尋找連續的已選擇時間槽 - 固定30分鐘步進
    let currentTime = clickedTime - 30
    while (currentTime >= 6 * 60) { // 從6點開始
      const h = Math.floor(currentTime / 60)
      const m = currentTime % 60
      const slotKey = `${dateStr}_${h}_${m}`
      
      // 如果是空格子且已選擇，則加入合併
      if (!getSlotData(slotKey) && selectedSlots.has(slotKey)) {
        mergedSlots.add(slotKey)
        currentTime -= 30
      } else {
        break
      }
    }
    
    // 向後尋找連續的已選擇時間槽 - 固定30分鐘步進
    currentTime = clickedTime + 30
    while (currentTime <= 22 * 60) { // 到22點結束
      const h = Math.floor(currentTime / 60)
      const m = currentTime % 60
      const slotKey = `${dateStr}_${h}_${m}`
      
      // 如果是空格子且已選擇，則加入合併
      if (!getSlotData(slotKey) && selectedSlots.has(slotKey)) {
        mergedSlots.add(slotKey)
        currentTime += 30
      } else {
        break
      }
    }
    
    return mergedSlots
  }
  
  // 自動應用活動到選中的時間槽
  const autoApplyActivity = (slots: Set<string>) => {
    if (selectedActivity && slots.size > 0) {
      slots.forEach(slotId => {
        setSlotActivity(slotId, selectedActivity)
      })
      // 清除選擇
      setSelectedSlots(new Set())
    }
  }

  // 拖拽開始
  const handleMouseDown = (slotId: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (e.button === 0) { // 左鍵
      setIsDragging(true)
      setDragStart(slotId)
      setDragSelection(new Set([slotId]))
    }
  }

  // 拖拽過程中
  const handleMouseEnter = (slotId: string, e: React.MouseEvent) => {
    if (isDragging && dragStart) {
      const selection = calculateDragSelection(dragStart, slotId)
      setDragSelection(selection)
    } else if (e.ctrlKey || e.metaKey) {
      // 保留原有的Ctrl預覽功能
      const mergedSlots = getMergedContinuousSlots(slotId)
      const previewOnly = new Set<string>()
      
      mergedSlots.forEach(slot => {
        if (!selectedSlots.has(slot)) {
          previewOnly.add(slot)
        }
      })
      
      setPreviewSlots(previewOnly)
    }
  }

  // 清除拖拽時的預覽效果
  const handleMouseLeave = () => {
    if (!isDragging) {
      setPreviewSlots(new Set())
    }
  }

  // 拖拽結束
  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging && dragSelection.size > 0) {
      setIsDragging(false)
      setShowActivitySelector(true) // 顯示活動選擇對話框
    }
  }

  // 處理活動選擇
  const handleActivitySelect = (activityId: string) => {
    if (dragSelection.size > 0) {
      dragSelection.forEach(slotId => {
        setSlotActivity(slotId, activityId)
      })
    }
    setShowActivitySelector(false)
    setDragSelection(new Set())
    setDragStart(null)
  }

  // 取消活動選擇
  const handleActivityCancel = () => {
    setShowActivitySelector(false)
    setDragSelection(new Set())
    setDragStart(null)
  }


  // 處理左鍵點擊
  const handleSlotClick = (slotId: string, e: React.MouseEvent) => {
    // 清除預覽
    setPreviewSlots(new Set())
    
    if (e.ctrlKey || e.metaKey) { // Ctrl功能永久啟用
      // Ctrl+點擊模式：智能選擇連續時間槽
      const newSelected = new Set(selectedSlots)
      
      if (newSelected.has(slotId)) {
        // 如果已選擇，則取消選擇
        newSelected.delete(slotId)
        setSelectedSlots(newSelected)
      } else {
        // 如果未選擇，則智能選擇連續區域
        newSelected.add(slotId)
        const mergedSlots = getMergedContinuousSlots(slotId)
        mergedSlots.forEach(slot => newSelected.add(slot))
        
        setSelectedSlots(newSelected)
      }
    } else {
      // 單選模式 - 總是顯示 popover
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      setPopoverPosition({ x: rect.right + 10, y: rect.top })
      setPopoverTarget(slotId)
      setShowPopover(true)
      setSelectedSlots(new Set())
    }
  }

  // 處理右鍵事件
  const handleSlotRightClick = (slotId: string, e: React.MouseEvent) => {
    e.preventDefault()
    const slotData = getSlotData(slotId)
    
    if (slotData) {
      // 右鍵已有活動 → 顯示完成/刪除選項
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      setPopoverPosition({ x: rect.right + 10, y: rect.top })
      setPopoverTarget(slotId)
      setShowPopover(true)
    }
  }

  // 完成活動
  const completeActivity = (slotId: string) => {
    setTimeboxData(prev => {
      const newData = { ...prev }
      if (newData[slotId]) {
        newData[slotId] = {
          ...newData[slotId],
          completed: true,
          completedAt: new Date().toISOString()
        }
      }
      return newData
    })
  }

  // 新增活動類型
  const addActivityType = (name: string, color: string, category: 'timing' | 'workout') => {
    const newActivity: TimeboxActivity = {
      id: `custom_${Date.now()}`,
      name,
      color,
      category
    }
    setActivityTypes(prev => [...prev, newActivity])
  }

  // 刪除活動類型
  const removeActivityType = (activityId: string) => {
    setActivityTypes(prev => prev.filter(a => a.id !== activityId))
  }

  // 修改活動顏色
  const updateActivityColor = (activityId: string, newColor: string) => {
    setActivityTypes(prev => prev.map(activity => 
      activity.id === activityId 
        ? { ...activity, color: newColor }
        : activity
    ))
  }

  // 處理活動右鍵菜單
  const handleActivityRightClick = (activityId: string, e: React.MouseEvent) => {
    e.preventDefault()
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setContextMenuPosition({ x: e.clientX, y: e.clientY })
    setSelectedActivityForEdit(activityId)
    setShowActivityContextMenu(true)
  }

  // 隨機生成新顏色
  const generateRandomColor = () => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // 檢測連續的活動時間槽並計算合併 - 跨時間單位版本
  const getActivityBlocks = (dayIndex: number) => {
    const blocks: Array<{
      startTime: { hour: number, minute: number }
      duration: number // 以分鐘為單位
      activity: string
      color: string
      slotCount: number
      activityData: TimeboxEntry
    }> = []
    
    // 為了正確檢測活動，我們需要掃描所有可能的時間點
    // 但只在當前時間單位的格子上顯示
    const allPossibleSlots: { time: number, data: TimeboxEntry | null, hour: number, minute: number }[] = []
    
    // 掃描所有30分鐘時間點（最細粒度）
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 22 && minute > 0) break
        
        const slotId = getSlotId(dayIndex, hour, minute)
        const slotData = getSlotData(slotId)
        
        allPossibleSlots.push({
          time: hour * 60 + minute,
          data: slotData,
          hour,
          minute
        })
      }
    }
    
    // 合併連續的相同活動
    let currentBlock: any = null
    
    for (const slot of allPossibleSlots) {
      if (slot.data) {
        if (currentBlock && 
            currentBlock.activity === slot.data.activity && 
            currentBlock.color === slot.data.color &&
            slot.time === currentBlock.endTime) {
          // 擴展現有區塊
          currentBlock.endTime = slot.time + 30 // 固定30分鐘步進
          currentBlock.duration += 30
        } else {
          // 開始新區塊
          if (currentBlock) {
            blocks.push({
              startTime: {
                hour: Math.floor(currentBlock.startTime / 60),
                minute: currentBlock.startTime % 60
              },
              duration: currentBlock.duration,
              slotCount: currentBlock.duration / 30, // 固定使用30分鐘為基準計算格子數
              activity: currentBlock.activity,
              color: currentBlock.color,
              activityData: currentBlock.data
            })
          }
          
          currentBlock = {
            startTime: slot.time,
            endTime: slot.time + 30,
            duration: 30,
            activity: slot.data.activity,
            color: slot.data.color,
            data: slot.data
          }
        }
      } else {
        // 沒有活動，結束當前區塊
        if (currentBlock) {
          blocks.push({
            startTime: {
              hour: Math.floor(currentBlock.startTime / 60),
              minute: currentBlock.startTime % 60
            },
            duration: currentBlock.duration,
            slotCount: currentBlock.duration / 30, // 固定使用30分鐘為基準計算格子數
            activity: currentBlock.activity,
            color: currentBlock.color,
            activityData: currentBlock.data
          })
          currentBlock = null
        }
      }
    }
    
    // 添加最後一個區塊
    if (currentBlock) {
      blocks.push({
        startTime: {
          hour: Math.floor(currentBlock.startTime / 60),
          minute: currentBlock.startTime % 60
        },
        duration: currentBlock.duration,
        slotCount: Math.ceil(currentBlock.duration / timeUnit), // 根據顯示單位精確計算格子數
        activity: currentBlock.activity,
        color: currentBlock.color,
        activityData: currentBlock.data
      })
    }
    
    // 調試最終結果
    if (timeUnit === 60 && blocks.length > 0) {
      console.log('🎯 60分鐘單位最終區塊:', blocks.map(b => `${b.activity}: ${b.duration}分鐘, slotCount: ${b.slotCount}`))
    }
    
    return blocks
  }

  // 批量設定選中的時間槽
  const applyActivityToSelected = () => {
    if (selectedActivity && selectedSlots.size > 0) {
      selectedSlots.forEach(slotId => {
        setSlotActivity(slotId, selectedActivity)
      })
      setSelectedSlots(new Set())
    }
  }

  // 清除選中的時間槽
  const clearSelectedSlots = () => {
    selectedSlots.forEach(slotId => {
      setSlotActivity(slotId, null)
    })
    setSelectedSlots(new Set())
  }

  // 計算選中時間槽的總時長
  const getSelectedDuration = () => {
    return selectedSlots.size
  }

  // 番茄鐘功能
  const startTimer = (activityId: string, duration: number = 25) => {
    setTimerState({
      isRunning: true,
      currentTime: duration * 60,
      totalTime: duration * 60,
      activityId,
      startTime: Date.now()
    })
  }

  const stopTimer = () => {
    setTimerState(null)
  }

  // 格式化時間
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 統計計算函數
  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0]
    const todayEntries = Object.values(timeboxData).filter(entry => 
      entry.id.startsWith(today)
    )
    
    const timingActivities = todayEntries.filter(entry => {
      const activity = activityTypes.find(a => a.name === entry.activity)
      return activity?.category === 'timing'
    })
    
    const workoutActivities = todayEntries.filter(entry => {
      const activity = activityTypes.find(a => a.name === entry.activity)
      return activity?.category === 'workout'
    })
    
    const completedTimeboxes = todayEntries.filter(entry => entry.completed).length
    const timingMinutes = timingActivities.length * timeUnit
    const workoutSets = workoutActivities.length
    
    return {
      completedTimeboxes,
      timingMinutes,
      workoutSets,
      totalActivities: todayEntries.length
    }
  }

  useEffect(() => {
    // 檢查認證狀態
    if (!authManager.isAuthenticated()) {
      return
    }
    const currentUser = authManager.getCurrentUser()
    setUser(currentUser)
  }, [])

  useEffect(() => {
    initCurrentWeek()
  }, [initCurrentWeek])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, loadData])

  useEffect(() => {
    saveData()
  }, [timeboxData, activityTypes, timerState, saveData])

  // 計時器倒數
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (timerState?.isRunning) {
      interval = setInterval(() => {
        setTimerState(prev => {
          if (!prev || prev.currentTime <= 0) return prev
          return { ...prev, currentTime: prev.currentTime - 1 }
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [timerState?.isRunning])

  // 鍵盤和拖拽事件監聽
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setShowCtrlHint(true)
      }
      if (e.key === 'Escape') {
        setSelectedSlots(new Set())
        setPreviewSlots(new Set())
        setDragSelection(new Set())
        setIsDragging(false)
        setShowActivitySelector(false)
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setShowCtrlHint(false)
        setPreviewSlots(new Set())
      }
    }

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        setIsDragging(false)
        if (dragSelection.size > 0) {
          setShowActivitySelector(true)
        } else {
          // 重置拖拽狀態
          setDragStart(null)
          setDragSelection(new Set())
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    document.addEventListener('mouseup', handleGlobalMouseUp)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, dragSelection])

  const { days, timeSlots } = generateTimeGrid()
  const weekRange = getWeekRange()

  if (!user) {
    return <div className="p-6">請先登入</div>
  }

  return (
    <div className="timebox-page">
      {/* 標題與導航 */}
      <div className="timebox-header">
        <div className="timebox-title-section">
          <h1 className="page-title">箱型時間</h1>
          <p className="week-range">{weekRange.start} - {weekRange.end}</p>
        </div>
        
        <div className="timebox-controls">
          <button
            onClick={() => navigateWeek('prev')}
            className="nav-btn"
          >
            ←
          </button>
          <button
            onClick={goToToday}
            className="nav-btn"
          >
            今天
          </button>
          <button
            onClick={() => navigateWeek('next')}
            className="nav-btn"
          >
            →
          </button>
          <button
            onClick={() => setShowActivityModal(true)}
            className="action-btn primary"
          >
            活動管理
          </button>
          <button
            onClick={() => setShowTimerPanel(!showTimerPanel)}
            className="action-btn secondary"
          >
            番茄鐘
          </button>
        </div>
      </div>

      {/* 控制工具列 */}
      <div className="timebox-toolbar">
        <div className="toolbar-content">
          <div className="time-unit-section">
            <span className="toolbar-label">時間單位：</span>
            {[30, 60].map(unit => (
              <button
                key={unit}
                onClick={() => setTimeUnit(unit)}
                className={`unit-btn ${
                  timeUnit === unit ? 'active' : ''
                }`}
              >
                {unit}分
              </button>
            ))}
          </div>

          {/* 活動選擇功能移除，優先使用 popover */}

          <div className="selection-info-section">
            {selectedSlots.size > 0 && (
              <div className="selection-info">
                已選擇 {getSelectedDuration()} 個時間槽 (Ctrl+點擊永久啟用)
              </div>
            )}
          </div>

          {selectedSlots.size > 0 && (
            <div className="batch-actions">
              <button
                onClick={clearSelectedSlots}
                className="batch-btn clear"
                title="清除選中的時間槽"
              >
                批量清除 ({selectedSlots.size})
              </button>
              <button
                onClick={() => setSelectedSlots(new Set())}
                className="batch-btn cancel"
                title="取消選擇"
              >
                取消選擇
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 番茄鐘面板 */}
      {showTimerPanel && (
        <div className="timer-panel">
          <div className="timer-header">
            <h3 className="timer-title">番茄鐘計時器</h3>
            <button
              onClick={() => setShowTimerPanel(false)}
              className="close-btn"
            >
              ✕
            </button>
          </div>
          
          {timerState ? (
            <div className="timer-display">
              <div className="timer-time">
                {formatTime(timerState.currentTime)}
              </div>
              <div className="timer-activity">
                活動：{activityTypes.find(a => a.id === timerState.activityId)?.name}
              </div>
              <button
                onClick={stopTimer}
                className="stop-btn"
              >
                停止計時
              </button>
            </div>
          ) : (
            <div className="timer-setup">
              <div className="duration-buttons">
                {[15, 25, 45].map(duration => (
                  <button
                    key={duration}
                    onClick={() => selectedActivity && startTimer(selectedActivity, duration)}
                    disabled={!selectedActivity}
                    className="duration-btn"
                  >
                    {duration}分鐘
                  </button>
                ))}
              </div>
              <p className="timer-hint">請先選擇活動類型</p>
            </div>
          )}
        </div>
      )}

      {/* 時間格子 */}
      <div className="timebox-grid">
        <div className="grid-container">
          {/* 表頭 */}
          <div className="grid-header">
            <div className="time-header">時間</div>
            {days.map(day => (
              <div key={day} className="day-header">
                <span className="day-full">{day}</span>
                <span className="day-short">{day.slice(1)}</span>
              </div>
            ))}
          </div>
          
          {/* Virtual Block Rendering - 智能合併顯示 */}
          {timeSlots.map((timeSlot, timeIndex) => {
            return (
              <div key={`${timeSlot.hour}-${timeSlot.minute}`} className="grid-row">
                <div className="time-cell">
                  {timeSlot.displayTime}
                </div>
                {days.map((_, dayIndex) => {
                  const slotId = getSlotId(dayIndex, timeSlot.hour, timeSlot.minute)
                  const slotData = getSlotData(slotId)
                  
                  // 檢查這個時間槽是否為活動區塊的開始
                  const activityBlocks = getActivityBlocks(dayIndex)
                  
                  let isBlockStart = null
                  if (timeUnit === 30) {
                    // ZOOM IN：精確匹配30分鐘格子
                    isBlockStart = activityBlocks.find(block => 
                      block.startTime.hour === timeSlot.hour && block.startTime.minute === timeSlot.minute
                    )
                  } else {
                    // ZOOM OUT：顯示跨越此小時的所有活動
                    const currentHourStart = timeSlot.hour * 60
                    const currentHourEnd = currentHourStart + 60
                    
                    // 找到開始於此小時或跨越此小時的活動
                    const relevantBlocks = activityBlocks.filter(block => {
                      const blockStart = block.startTime.hour * 60 + block.startTime.minute
                      const blockStartHour = block.startTime.hour
                      
                      // 只顯示在此小時開始的活動
                      return blockStartHour === timeSlot.hour
                    })
                    
                    if (relevantBlocks.length > 0) {
                      const firstBlock = relevantBlocks[0]
                      isBlockStart = {
                        startTime: { hour: timeSlot.hour, minute: 0 },
                        activity: firstBlock.activity,
                        color: firstBlock.color,
                        duration: firstBlock.duration,
                        slotCount: Math.ceil(firstBlock.duration / 60),
                        activityData: firstBlock.activityData
                      }
                    }
                  }
                  
                  // 檢查這個時間槽是否為活動區塊的中間部分
                  const isInsideBlock = activityBlocks.some(block => {
                    const blockStartTime = block.startTime.hour * 60 + block.startTime.minute
                    const blockEndTime = blockStartTime + block.duration
                    const currentTime = timeSlot.hour * 60 + timeSlot.minute
                    return currentTime > blockStartTime && currentTime < blockEndTime
                  })
                  
                  return (
                    <div
                      key={`${dayIndex}-${timeSlot.hour}-${timeSlot.minute}`}
                      className={`slot-cell ${selectedSlots.has(slotId) ? 'selected' : ''} ${previewSlots.has(slotId) ? 'preview' : ''} ${dragSelection.has(slotId) ? 'drag-selected' : ''} ${isInsideBlock ? 'inside-block' : ''}`}
                      onClick={(e) => handleSlotClick(slotId, e)}
                      onContextMenu={(e) => handleSlotRightClick(slotId, e)}
                      onMouseDown={(e) => handleMouseDown(slotId, e)}
                      onMouseEnter={(e) => handleMouseEnter(slotId, e)}
                      onMouseLeave={handleMouseLeave}
                      style={{ position: 'relative', userSelect: 'none' }}
                    >
                      {isBlockStart ? (
                        // 合併區塊的起始格子 - 使用CSS Grid跨越
                        <div
                          className="merged-activity-block"
                          style={{ 
                            backgroundColor: isBlockStart.color,
                            position: 'absolute',
                            top: '2px',
                            left: '4px',
                            right: '4px',
                            height: `${Math.round(isBlockStart.slotCount * (timeUnit === 30 ? 40 : 60)) - 2}px`,
                            zIndex: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: '6px',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            border: '1px solid rgba(255,255,255,0.3)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                          }}
                        >
                          <span className="activity-name">{isBlockStart.activity}</span>
                          <span className="activity-duration">
                            {isBlockStart.duration >= 60 
                              ? `${Math.round(isBlockStart.duration / 60 * 10) / 10}h` 
                              : `${isBlockStart.duration}m`}
                          </span>
                        </div>
                      ) : slotData && !isInsideBlock ? (
                        // 單獨的活動格子（非連續的）
                        <div
                          className={`activity-block ${slotData.completed ? 'completed' : ''}`}
                          style={{ backgroundColor: slotData.color }}
                        >
                          <span className="activity-name">{slotData.activity}</span>
                          <span className="activity-short">{slotData.activity.charAt(0)}</span>
                          {slotData.completed && (
                            <div className="completion-indicator">✓</div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* 統計區域 - 參考 gamelife2.0 設計 */}
      <div className="timebox-stats">
        <h4>今日統計</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">{calculateStats().completedTimeboxes}</div>
            <div className="stat-label">完成時間盒</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{calculateStats().timingMinutes}</div>
            <div className="stat-label">計時活動 (分鐘)</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{calculateStats().workoutSets}</div>
            <div className="stat-label">重訓組數</div>
          </div>
        </div>
      </div>

      {/* 活動管理模態框 */}
      {showActivityModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">活動管理</h3>
              <button
                onClick={() => setShowActivityModal(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="activity-management">
                <div className="add-activity-section">
                  <h4>新增活動</h4>
                  <div className="add-activity-form">
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="活動名稱"
                        value={newActivityName}
                        onChange={(e) => setNewActivityName(e.target.value)}
                        className="activity-input"
                      />
                      <input
                        type="color"
                        value={newActivityColor}
                        onChange={(e) => setNewActivityColor(e.target.value)}
                        className="color-input"
                      />
                      <select
                        value={newActivityCategory}
                        onChange={(e) => setNewActivityCategory(e.target.value as 'timing' | 'workout')}
                        className="category-select"
                      >
                        <option value="timing">計時</option>
                        <option value="workout">重訓</option>
                      </select>
                      <button
                        onClick={() => {
                          if (newActivityName.trim()) {
                            addActivityType(newActivityName.trim(), newActivityColor, newActivityCategory)
                            setNewActivityName('')
                            setNewActivityColor('#3b82f6')
                            setNewActivityCategory('timing')
                          }
                        }}
                        className="add-btn"
                        disabled={!newActivityName.trim()}
                      >
                        新增
                      </button>
                    </div>
                  </div>
                </div>
                
                {activityTypes.length > 0 && (
                  <div className="activity-grid-section">
                    <h4>現有活動</h4>
                    <div className="activity-grid">
                      {activityTypes.map(activity => (
                        <div 
                          key={activity.id} 
                          className="activity-square"
                          onContextMenu={(e) => handleActivityRightClick(activity.id, e)}
                        >
                          <div 
                            className="activity-color-square"
                            style={{ backgroundColor: activity.color }}
                          />
                          <div className="activity-name-label">{activity.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowActivityModal(false)}
                className="modal-btn primary"
              >
                確定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 活動選擇對話框 */}
      {showActivitySelector && (
        <div className="modal-overlay">
          <div className="activity-selector-modal">
            <div className="selector-header">
              <h3 className="selector-title">選擇活動</h3>
              <div className="selector-info">
                已選擇 {dragSelection.size} 個時間槽
              </div>
            </div>
            
            <div className="selector-body">
              <div className="activity-grid">
                {activityTypes.map(activity => (
                  <div
                    key={activity.id}
                    onClick={() => handleActivitySelect(activity.id)}
                    className="activity-option"
                    style={{ backgroundColor: activity.color }}
                    title={`${activity.name} - ${activity.description}`}
                  >
                    <div className="activity-icon">{activity.name.charAt(0)}</div>
                    <div className="activity-label">{activity.name}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="selector-footer">
              <button
                onClick={handleActivityCancel}
                className="cancel-btn"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popover 記錄界面 */}
      {showPopover && popoverTarget && (
        <>
          <div 
            className="popover-overlay"
            onClick={() => setShowPopover(false)}
          />
          <div 
            className="activity-popover"
            style={{
              position: 'fixed',
              left: popoverPosition.x,
              top: popoverPosition.y,
              zIndex: 1000
            }}
          >
            <div className="popover-header">
              <h4>選擇活動</h4>
              <button
                onClick={() => setShowPopover(false)}
                className="popover-close"
              >
                ✕
              </button>
            </div>
            
            <div className="popover-content">
              <div className="activity-selector">
                {activityTypes.length === 0 ? (
                  <div className="no-activities">
                    <p>尚未建立活動</p>
                    <button
                      onClick={() => {
                        setShowPopover(false)
                        setShowActivityModal(true)
                      }}
                      className="create-activity-btn"
                    >
                      ➕ 建立活動
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="activity-options">
                      {activityTypes.map(activity => (
                        <button
                          key={activity.id}
                          onClick={() => {
                            setSlotActivity(popoverTarget!, activity.id)
                            setShowPopover(false)
                          }}
                          className="activity-option-btn"
                          style={{ 
                            backgroundColor: activity.color,
                            color: 'white'
                          }}
                        >
                          <span className="activity-letter">{activity.name.charAt(0)}</span>
                          <span className="activity-name">{activity.name}</span>
                        </button>
                      ))}
                    </div>
                    
                    {getSlotData(popoverTarget!) && (
                      <div className="existing-activity-actions">
                        <button
                          onClick={() => {
                            if (popoverTarget) {
                              completeActivity(popoverTarget)
                            }
                            setShowPopover(false)
                          }}
                          className="action-btn complete"
                        >
                          ✓ 完成
                        </button>
                        
                        <button
                          onClick={() => {
                            setSlotActivity(popoverTarget, null)
                            setShowPopover(false)
                          }}
                          className="action-btn delete"
                        >
                          🗑 清除
                        </button>
                        
                        <button
                          onClick={() => {
                            const slotData = getSlotData(popoverTarget!)
                            if (slotData && slotData.activityData) {
                              const activity = activityTypes.find(a => a.id === slotData.activityData.activityId)
                              if (activity?.category === 'timing') {
                                setShowTimingRecord(true)
                              } else if (activity?.category === 'workout') {
                                setShowWorkoutRecord(true)
                              }
                            }
                            setShowPopover(false)
                          }}
                          className="action-btn record"
                        >
                          📊 記錄
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 活動右鍵菜單 */}
      {showActivityContextMenu && selectedActivityForEdit && (
        <>
          <div 
            className="context-menu-overlay"
            onClick={() => setShowActivityContextMenu(false)}
          />
          <div 
            className="activity-context-menu"
            style={{
              position: 'fixed',
              left: contextMenuPosition.x,
              top: contextMenuPosition.y,
              zIndex: 1001
            }}
          >
            <div className="context-menu-header">
              <h4>編輯活動</h4>
            </div>
            
            <div className="context-menu-content">
              <div className="color-picker-section">
                <div className="color-picker-label">🎨 選擇顏色</div>
                <div className="color-options">
                  {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'].map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        updateActivityColor(selectedActivityForEdit, color)
                        setShowActivityContextMenu(false)
                      }}
                      className="color-option"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => {
                  removeActivityType(selectedActivityForEdit)
                  setShowActivityContextMenu(false)
                }}
                className="context-menu-btn delete"
              >
                🗑 刪除活動
              </button>
            </div>
          </div>
        </>
      )}

      {/* 計時記錄對話框 */}
      {showTimingRecord && (
        <div className="modal-overlay">
          <div className="record-modal">
            <div className="modal-header">
              <h3>計時記錄</h3>
              <button
                onClick={() => setShowTimingRecord(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="timing-input">
                <label>實際花費時間（分鐘）：</label>
                <input
                  type="number"
                  value={timingMinutes}
                  onChange={(e) => setTimingMinutes(parseInt(e.target.value) || 0)}
                  min="0"
                  className="time-input"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => {
                  if (popoverTarget && timingMinutes > 0) {
                    setTimeboxData(prev => {
                      const newData = { ...prev }
                      if (newData[popoverTarget]) {
                        newData[popoverTarget] = {
                          ...newData[popoverTarget],
                          timingRecord: {
                            minutes: timingMinutes,
                            recordedAt: new Date().toISOString()
                          }
                        }
                      }
                      return newData
                    })
                  }
                  setShowTimingRecord(false)
                  setTimingMinutes(0)
                }}
                className="modal-btn primary"
              >
                保存記錄
              </button>
              <button
                onClick={() => setShowTimingRecord(false)}
                className="modal-btn secondary"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 重訓記錄對話框 */}
      {showWorkoutRecord && (
        <div className="modal-overlay">
          <div className="record-modal">
            <div className="modal-header">
              <h3>重訓記錄</h3>
              <button
                onClick={() => setShowWorkoutRecord(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="workout-inputs">
                <div className="input-group">
                  <label>項目：</label>
                  <input
                    type="text"
                    value={workoutData.exercise}
                    onChange={(e) => setWorkoutData({...workoutData, exercise: e.target.value})}
                    placeholder="如：臥推、深蹲"
                    className="text-input"
                  />
                </div>
                
                <div className="input-row">
                  <div className="input-group">
                    <label>次數：</label>
                    <input
                      type="number"
                      value={workoutData.reps}
                      onChange={(e) => setWorkoutData({...workoutData, reps: parseInt(e.target.value) || 0})}
                      min="0"
                      className="number-input"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label>組數：</label>
                    <input
                      type="number"
                      value={workoutData.sets}
                      onChange={(e) => setWorkoutData({...workoutData, sets: parseInt(e.target.value) || 0})}
                      min="0"
                      className="number-input"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => {
                  if (popoverTarget && workoutData.exercise && workoutData.reps > 0 && workoutData.sets > 0) {
                    setTimeboxData(prev => {
                      const newData = { ...prev }
                      if (newData[popoverTarget]) {
                        const existingRecords = newData[popoverTarget].workoutRecords || []
                        newData[popoverTarget] = {
                          ...newData[popoverTarget],
                          workoutRecords: [
                            ...existingRecords,
                            {
                              exercise: workoutData.exercise,
                              reps: workoutData.reps,
                              sets: workoutData.sets,
                              recordedAt: new Date().toISOString()
                            }
                          ]
                        }
                      }
                      return newData
                    })
                  }
                  setShowWorkoutRecord(false)
                  setWorkoutData({ exercise: '', reps: 0, sets: 0 })
                }}
                className="modal-btn primary"
              >
                添加記錄
              </button>
              <button
                onClick={() => setShowWorkoutRecord(false)}
                className="modal-btn secondary"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS樣式 */}
      <style jsx>{`
        .timebox-page {
          padding: 24px 0;
          background: transparent;
          min-height: calc(100vh - 140px);
        }

        /* 標題區域 */
        .timebox-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .timebox-title-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .page-title {
          font-size: 32px;
          font-weight: 700;
          color: #3a3833;
          margin: 0;
          text-shadow: 0 1px 2px rgba(201, 169, 97, 0.1);
        }

        .week-range {
          font-size: 16px;
          color: #6d685f;
          font-weight: 500;
          margin: 0;
        }

        .timebox-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .nav-btn {
          padding: 10px 16px;
          background: rgba(255, 253, 250, 0.9);
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 12px;
          color: #6d685f;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .nav-btn:hover {
          background: rgba(201, 169, 97, 0.1);
          border-color: rgba(201, 169, 97, 0.5);
          transform: translateY(-1px);
        }

        .action-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #c9a961, #b8985a);
          color: white;
          box-shadow: 0 4px 15px rgba(201, 169, 97, 0.3);
        }

        .action-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(201, 169, 97, 0.4);
        }

        .action-btn.secondary {
          background: linear-gradient(135deg, #e67e22, #d68910);
          color: white;
          box-shadow: 0 4px 15px rgba(230, 126, 34, 0.3);
        }

        .action-btn.secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(230, 126, 34, 0.4);
        }

        /* 工具列 */
        .timebox-toolbar {
          background: rgba(255, 253, 250, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(201, 169, 97, 0.2);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 8px 32px rgba(201, 169, 97, 0.15);
        }

        .toolbar-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .time-unit-section,
        .activity-section,
        .multi-select-section {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .batch-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .toolbar-label {
          font-size: 16px;
          font-weight: 600;
          color: #3a3833;
          min-width: 100px;
        }

        .unit-btn {
          padding: 8px 16px;
          background: rgba(255, 253, 250, 0.7);
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 10px;
          color: #6d685f;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .unit-btn:hover {
          background: rgba(201, 169, 97, 0.1);
          transform: translateY(-1px);
        }

        .unit-btn.active {
          background: linear-gradient(135deg, #c9a961, #b8985a);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(201, 169, 97, 0.3);
        }

        .activity-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .activity-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .activity-btn:hover {
          transform: scale(1.1);
        }

        .activity-btn.selected {
          transform: scale(1.15);
          box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.5), 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        /* 番茄鐘面板 */
        .timer-panel {
          background: rgba(255, 253, 250, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(201, 169, 97, 0.2);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 8px 32px rgba(230, 126, 34, 0.15);
        }

        .timer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .timer-title {
          font-size: 20px;
          font-weight: 600;
          color: #3a3833;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          color: #6d685f;
          font-size: 20px;
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s ease;
        }

        .close-btn:hover {
          color: #3a3833;
        }

        .timer-display {
          text-align: center;
        }

        .timer-time {
          font-size: 48px;
          font-weight: 700;
          color: #e67e22;
          margin-bottom: 12px;
          text-shadow: 0 2px 4px rgba(230, 126, 34, 0.2);
        }

        .timer-activity {
          font-size: 16px;
          color: #6d685f;
          margin-bottom: 24px;
        }

        .stop-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
        }

        .stop-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
        }

        .duration-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .duration-btn {
          padding: 12px 16px;
          background: linear-gradient(135deg, #e67e22, #d68910);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(230, 126, 34, 0.3);
        }

        .duration-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(230, 126, 34, 0.4);
        }

        .duration-btn:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
          box-shadow: none;
        }

        .timer-hint {
          font-size: 14px;
          color: #6d685f;
          text-align: center;
          margin: 0;
        }

        /* 時間格子 */
        .timebox-grid {
          background: rgba(255, 253, 250, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(201, 169, 97, 0.2);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 24px;
          box-shadow: 0 8px 32px rgba(201, 169, 97, 0.15);
        }

        .grid-container {
          min-width: 800px;
        }

        .grid-header {
          display: grid;
          grid-template-columns: 120px repeat(7, 1fr);
          background: rgba(201, 169, 97, 0.1);
          border-bottom: 2px solid rgba(201, 169, 97, 0.2);
        }

        .time-header,
        .day-header {
          padding: 16px 12px;
          font-size: 14px;
          font-weight: 600;
          color: #3a3833;
          text-align: center;
        }

        .day-short {
          display: none;
        }

        .grid-row {
          display: grid;
          grid-template-columns: 120px repeat(7, 1fr);
          border-bottom: 1px solid rgba(201, 169, 97, 0.1);
          transition: background-color 0.2s ease;
        }

        .grid-row:hover {
          background: rgba(201, 169, 97, 0.05);
        }

        .time-cell {
          padding: 16px 12px;
          font-size: 14px;
          font-weight: 500;
          color: #6d685f;
          background: rgba(201, 169, 97, 0.05);
          border-right: 1px solid rgba(201, 169, 97, 0.1);
          display: flex;
          align-items: center;
        }

        .slot-cell {
          padding: 2px;
          min-height: ${timeUnit === 30 ? '40px' : '60px'};
          border-right: 1px solid rgba(201, 169, 97, 0.1);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: stretch;
        }

        .slot-cell:hover {
          background: rgba(52, 152, 219, 0.1);
        }

        .slot-cell.selected {
          background: rgba(201, 169, 97, 0.3);
          border: 2px solid rgba(201, 169, 97, 0.8);
          transform: scale(0.95);
        }

        .slot-cell.preview {
          background: rgba(52, 152, 219, 0.15) !important;
          border: 2px dashed rgba(52, 152, 219, 0.6) !important;
          transform: scale(1.01);
          transition: all 0.2s ease;
        }

        .slot-cell.drag-selected {
          background: rgba(34, 197, 94, 0.2) !important;
          border: 2px solid rgba(34, 197, 94, 0.8) !important;
          transform: scale(0.98);
          box-shadow: inset 0 0 8px rgba(34, 197, 94, 0.3);
          transition: all 0.1s ease;
        }

        .merged-activity {
          border-radius: 12px;
          margin: 2px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
          position: relative;
        }

        .merged-activity:hover {
          transform: scale(1.02);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .merged-activity .activity-name {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .merged-activity .activity-duration {
          font-size: 12px;
          opacity: 0.9;
        }

        .merged-hidden {
          background: transparent !important;
        }

        .merged-block {
          border-radius: 12px;
          color: white;
          font-weight: bold;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.2);
          min-height: calc(100% + 4px); /* 考慮border間距 */
        }

        .merged-block .activity-name {
          font-size: 14px;
          margin-bottom: 4px;
        }

        .merged-block .activity-duration {
          font-size: 12px;
          opacity: 0.9;
        }

        .inside-block {
          background: transparent !important;
          pointer-events: none;
        }

        .merged-activity-block {
          border-radius: 8px;
          color: white;
          font-weight: bold;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: all 0.2s ease;
        }

        .merged-activity-block:hover {
          transform: scale(1.02);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .merged-activity-block .activity-name {
          font-size: 14px;
          margin-bottom: 4px;
        }

        .merged-activity-block .activity-duration {
          font-size: 12px;
          opacity: 0.9;
        }

        .ctrl-hint {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.85);
          color: white;
          padding: 10px 15px;
          border-radius: 8px;
          font-size: 0.9em;
          pointer-events: none;
          z-index: 1000;
          max-width: 250px;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          animation: fadeInUp 0.3s ease;
        }

        .ctrl-hint kbd {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.85em;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .activity-block {
          width: 100%;
          border-radius: 8px;
          padding: 8px;
          color: white;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          position: relative;
        }

        .activity-block.completed {
          opacity: 0.7;
        }

        .completion-indicator {
          position: absolute;
          top: 2px;
          right: 2px;
          background: rgba(34, 197, 94, 0.9);
          color: white;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        /* 多選模式相關樣式 */
        .mode-toggle-btn {
          padding: 8px 16px;
          background: rgba(255, 253, 250, 0.7);
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 10px;
          color: #6d685f;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mode-toggle-btn:hover {
          background: rgba(201, 169, 97, 0.1);
          transform: translateY(-1px);
        }

        .mode-toggle-btn.active {
          background: linear-gradient(135deg, #c9a961, #b8985a);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(201, 169, 97, 0.3);
        }

        .selection-info {
          padding: 4px 12px;
          background: rgba(201, 169, 97, 0.1);
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #8b7355;
        }

        .batch-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }

        .batch-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .batch-btn.apply {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .batch-btn.apply:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        .batch-btn.clear {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .batch-btn.clear:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        }

        .batch-btn.cancel {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
          border: 1px solid rgba(107, 114, 128, 0.3);
        }

        .batch-btn.cancel:hover {
          background: rgba(107, 114, 128, 0.2);
          transform: translateY(-1px);
        }

        /* 活動管理模態框樣式 */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: rgba(255, 253, 250, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(201, 169, 97, 0.2);
          border-radius: 20px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(201, 169, 97, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid rgba(201, 169, 97, 0.2);
        }

        .modal-title {
          font-size: 20px;
          font-weight: 600;
          color: #3a3833;
          margin: 0;
        }

        .modal-body {
          padding: 24px;
          max-height: 60vh;
          overflow-y: auto;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(255, 253, 250, 0.7);
          border: 1px solid rgba(201, 169, 97, 0.2);
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .activity-item:hover {
          background: rgba(201, 169, 97, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(201, 169, 97, 0.2);
        }

        .activity-color-preview {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .activity-info {
          flex: 1;
        }

        .activity-name {
          font-weight: 600;
          color: #3a3833;
          margin-bottom: 4px;
        }

        .activity-description {
          font-size: 14px;
          color: #6d685f;
        }

        .activity-category {
          padding: 4px 12px;
          background: rgba(201, 169, 97, 0.1);
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          color: #8b7355;
        }

        .modal-footer {
          padding: 20px 24px;
          border-top: 1px solid rgba(201, 169, 97, 0.2);
          display: flex;
          justify-content: flex-end;
        }

        .modal-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-btn.primary {
          background: linear-gradient(135deg, #c9a961, #b8985a);
          color: white;
          box-shadow: 0 4px 15px rgba(201, 169, 97, 0.3);
        }

        .modal-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(201, 169, 97, 0.4);
        }

        .activity-short {
          display: none;
        }

        /* 統計區域 - 參考 gamelife2.0 設計 */
        .timebox-stats {
          background: rgba(255, 253, 250, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(201, 169, 97, 0.2);
          border-radius: 16px;
          padding: 30px;
          margin-top: 30px;
          box-shadow: 0 8px 32px rgba(201, 169, 97, 0.15);
        }
        .timebox-stats h4 {
          font-size: 20px;
          font-weight: 600;
          color: #3a3833;
          margin: 0 0 16px 0;
          text-align: center;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .stat-item {
          text-align: center;
        }
        .stat-number {
          font-size: 24px;
          font-weight: 600;
          color: #c9a961;
          margin-bottom: 4px;
        }
        .stat-label {
          font-size: 12px;
          color: #6d685f;
        }

        /* 響應式設計 */
        @media (max-width: 1024px) {
          .timebox-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }

          .timebox-controls {
            width: 100%;
            justify-content: flex-start;
          }

          .toolbar-content {
            gap: 16px;
          }

          .time-unit-section,
          .activity-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .toolbar-label {
            min-width: auto;
          }
        }

        @media (max-width: 768px) {
          .timebox-page {
            padding: 16px 0;
          }

          .page-title {
            font-size: 28px;
          }

          .timebox-toolbar {
            padding: 20px;
          }

          .timer-panel {
            padding: 20px;
          }

          .stats-card {
            padding: 20px;
          }

          .grid-header {
            grid-template-columns: 80px repeat(7, 1fr);
          }

          .grid-row {
            grid-template-columns: 80px repeat(7, 1fr);
          }

          .time-header,
          .day-header {
            padding: 12px 8px;
            font-size: 12px;
          }

          .time-cell {
            padding: 12px 8px;
            font-size: 12px;
          }

          .slot-cell {
            min-height: 48px;
          }

          .day-full {
            display: none;
          }

          .day-short {
            display: block;
          }

          .activity-name {
            display: none;
          }

          .activity-short {
            display: block;
          }
        }

        @media (max-width: 640px) {
          .duration-buttons {
            grid-template-columns: 1fr;
          }
        }

        /* 活動選擇對話框樣式 */
        .activity-selector-modal {
          background: rgba(255, 253, 250, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(201, 169, 97, 0.2);
          border-radius: 20px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(201, 169, 97, 0.3);
          animation: slideInScale 0.3s ease;
        }

        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .selector-header {
          padding: 24px;
          border-bottom: 1px solid rgba(201, 169, 97, 0.2);
          text-align: center;
        }

        .selector-title {
          font-size: 20px;
          font-weight: 600;
          color: #3a3833;
          margin: 0 0 8px 0;
        }

        .selector-info {
          font-size: 14px;
          color: #6d685f;
          background: rgba(34, 197, 94, 0.1);
          padding: 4px 12px;
          border-radius: 12px;
          display: inline-block;
        }

        .selector-body {
          padding: 24px;
        }

        .activity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
        }

        .activity-option {
          padding: 20px 12px;
          border-radius: 16px;
          text-align: center;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .activity-option:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .activity-icon {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .activity-label {
          font-size: 14px;
          font-weight: 600;
        }

        .selector-footer {
          padding: 20px 24px;
          border-top: 1px solid rgba(201, 169, 97, 0.2);
          text-align: center;
        }

        .cancel-btn {
          padding: 10px 24px;
          background: rgba(107, 114, 128, 0.1);
          border: 1px solid rgba(107, 114, 128, 0.3);
          border-radius: 12px;
          color: #6b7280;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn:hover {
          background: rgba(107, 114, 128, 0.2);
          transform: translateY(-1px);
        }

        /* Popover 樣式 */
        .popover-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 999;
        }

        .activity-popover {
          background: rgba(255, 253, 250, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(201, 169, 97, 0.2);
          min-width: 200px;
          animation: popoverFadeIn 0.2s ease;
        }

        @keyframes popoverFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .popover-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(201, 169, 97, 0.2);
        }

        .popover-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #3a3833;
        }

        .popover-close {
          background: none;
          border: none;
          color: #6d685f;
          font-size: 14px;
          cursor: pointer;
          padding: 4px;
        }

        .popover-close:hover {
          color: #3a3833;
        }

        .popover-content {
          padding: 12px;
        }

        .popover-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .popover-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .popover-btn.complete {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .popover-btn.complete:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .popover-btn.delete {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .popover-btn.delete:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .popover-records {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .record-btn {
          padding: 8px 12px;
          background: rgba(201, 169, 97, 0.1);
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 6px;
          color: #6d685f;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .record-btn:hover {
          background: rgba(201, 169, 97, 0.2);
          transform: translateY(-1px);
        }

        /* 記錄對話框樣式 */
        .record-modal {
          background: rgba(255, 253, 250, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(201, 169, 97, 0.2);
          border-radius: 20px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(201, 169, 97, 0.3);
        }

        .timing-input,
        .workout-inputs {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .input-group label {
          font-size: 14px;
          font-weight: 600;
          color: #3a3833;
        }

        .time-input,
        .text-input,
        .number-input {
          padding: 10px 12px;
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 8px;
          background: rgba(255, 253, 250, 0.7);
          color: #3a3833;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .time-input:focus,
        .text-input:focus,
        .number-input:focus {
          outline: none;
          border-color: rgba(201, 169, 97, 0.6);
          box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.1);
        }

        .number-input {
          text-align: center;
        }

        .modal-btn.secondary {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
          border: 1px solid rgba(107, 114, 128, 0.3);
        }

        .modal-btn.secondary:hover {
          background: rgba(107, 114, 128, 0.2);
          transform: translateY(-1px);
        }

        /* 活動管理新增界面樣式 */
        .activity-management {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .add-activity-section h4,
        .activity-list h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #3a3833;
          border-bottom: 1px solid rgba(201, 169, 97, 0.2);
          padding-bottom: 8px;
        }

        .add-activity-form {
          background: rgba(201, 169, 97, 0.05);
          border-radius: 12px;
          padding: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 2fr auto auto auto;
          gap: 12px;
          align-items: center;
        }

        .activity-input {
          padding: 8px 12px;
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 8px;
          background: white;
          font-size: 14px;
          color: #3a3833;
        }

        .activity-input:focus {
          outline: none;
          border-color: rgba(201, 169, 97, 0.6);
          box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.1);
        }

        .color-input {
          width: 40px;
          height: 34px;
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 6px;
          cursor: pointer;
          background: none;
          padding: 2px;
        }

        .category-select {
          padding: 8px 12px;
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 8px;
          background: white;
          font-size: 14px;
          color: #3a3833;
          cursor: pointer;
        }

        .category-select:focus {
          outline: none;
          border-color: rgba(201, 169, 97, 0.6);
        }

        .add-btn {
          padding: 8px 16px;
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .add-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .activity-category-tag {
          padding: 4px 8px;
          background: rgba(201, 169, 97, 0.1);
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          color: #8b7355;
        }

        .remove-btn {
          background: none;
          border: none;
          color: #ef4444;
          font-size: 16px;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .remove-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          transform: scale(1.1);
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #6d685f;
          background: rgba(201, 169, 97, 0.05);
          border: 2px dashed rgba(201, 169, 97, 0.3);
          border-radius: 12px;
        }

        .empty-state p {
          margin: 0 0 8px 0;
          font-size: 14px;
        }

        .empty-state p:first-child {
          font-weight: 600;
          color: #3a3833;
        }

        .activity-grid-section {
          margin-top: 24px;
        }

        .activity-grid-section h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #3a3833;
          border-bottom: 1px solid rgba(201, 169, 97, 0.2);
          padding-bottom: 8px;
        }

        .activity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 16px;
          padding: 16px 0;
        }

        .activity-square {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .activity-square:hover {
          transform: translateY(-2px);
        }

        .activity-color-square {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.3);
          transition: all 0.2s ease;
        }

        .activity-square:hover .activity-color-square {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .activity-name-label {
          font-size: 12px;
          font-weight: 500;
          color: #3a3833;
          text-align: center;
          line-height: 1.2;
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* 右鍵菜單樣式 */
        .context-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
        }

        .activity-context-menu {
          background: rgba(255, 253, 250, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(201, 169, 97, 0.2);
          min-width: 180px;
          animation: contextMenuFadeIn 0.2s ease;
        }

        @keyframes contextMenuFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .context-menu-header {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(201, 169, 97, 0.2);
        }

        .context-menu-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #3a3833;
        }

        .context-menu-content {
          padding: 8px;
        }

        .context-menu-btn {
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 6px;
          color: #3a3833;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .context-menu-btn:hover {
          background: rgba(201, 169, 97, 0.1);
          transform: translateX(2px);
        }

        .context-menu-btn.change-color:hover {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .context-menu-btn.delete:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        /* 顏色選擇器樣式 */
        .color-picker-section {
          padding: 8px 0;
        }

        .color-picker-label {
          font-size: 13px;
          font-weight: 500;
          color: #3a3833;
          margin-bottom: 8px;
          padding: 0 4px;
        }

        .color-options {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          padding: 0 4px;
        }

        .color-option {
          width: 28px;
          height: 28px;
          border: 2px solid #e5e5e5;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .color-option:hover {
          border-color: #3a3833;
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        /* Popover 活動選擇樣式 */
        .activity-selector {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .no-activities {
          text-align: center;
          padding: 20px;
          color: #6d685f;
        }

        .no-activities p {
          margin: 0 0 12px 0;
          font-size: 14px;
        }

        .create-activity-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .create-activity-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .activity-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 200px;
          overflow-y: auto;
        }

        .activity-option-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .activity-option-btn:hover {
          transform: translateX(2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .activity-letter {
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 12px;
        }

        .activity-name {
          font-size: 13px;
          font-weight: 500;
        }

        .existing-activity-actions {
          display: flex;
          gap: 8px;
          padding-top: 12px;
          border-top: 1px solid rgba(201, 169, 97, 0.2);
        }

        .action-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn.complete {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .action-btn.complete:hover {
          background: rgba(34, 197, 94, 0.2);
        }

        .action-btn.delete {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .action-btn.delete:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .action-btn.record {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .action-btn.record:hover {
          background: rgba(59, 130, 246, 0.2);
        }

        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          
          .color-input {
            width: 100%;
            height: 40px;
          }
        }
      `}</style>

      {/* Ctrl 提示 */}
      {showCtrlHint && (
        <div className="ctrl-hint">
          {selectedActivity ? (
            <>
              選擇 <strong>{selectedActivity}</strong> 活動中<br />
              <kbd>Ctrl</kbd> + 點擊時間槽自動設定活動
            </>
          ) : (
            <>
              按住 <kbd>Ctrl</kbd> 點擊可選擇多個時間槽<br />
              連續選擇的時間會自動合併
            </>
          )}
        </div>
      )}
    </div>
  )
}