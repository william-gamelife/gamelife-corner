import { useState, useEffect, useCallback } from 'react'
import { TimeboxAPI } from '@/lib/api/TimeboxAPI'
import { TimeboxEntry, TimeboxActivity } from '@/lib/types'
import { useAuth } from './useAuth'

export function useTimebox(weekStart: Date) {
  const { userId } = useAuth()
  const [entries, setEntries] = useState<TimeboxEntry[]>([])
  const [activities, setActivities] = useState<TimeboxActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const loadEntries = useCallback(async () => {
    if (!userId) return
    
    setLoading(true)
    setError(null)
    try {
      const weekStartStr = weekStart.toISOString()
      const entriesData = await TimeboxAPI.getEntries(userId, weekStartStr)
      const activitiesData = await TimeboxAPI.getActivities(userId)
      
      setEntries(entriesData)
      setActivities(activitiesData)
    } catch (err) {
      setError('載入時間盒失敗')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [userId, weekStart])
  
  const createEntry = async (data: Partial<TimeboxEntry>) => {
    if (!userId) return { success: false, error: '未登入' }
    
    const entryData = {
      ...data,
      weekStart: weekStart.toISOString()
    }
    
    const result = await TimeboxAPI.createEntry(userId, entryData)
    if (result.success) {
      await loadEntries()
    }
    return result
  }
  
  const updateEntry = async (id: string, data: Partial<TimeboxEntry>) => {
    if (!userId) return { success: false, error: '未登入' }
    
    const result = await TimeboxAPI.updateEntry(userId, id, data)
    if (result.success) {
      await loadEntries()
    }
    return result
  }
  
  const deleteEntry = async (id: string) => {
    if (!userId) return { success: false, error: '未登入' }
    
    const result = await TimeboxAPI.deleteEntry(userId, id)
    if (result.success) {
      await loadEntries()
    }
    return result
  }
  
  const bulkCreateEntries = async (entries: Partial<TimeboxEntry>[]) => {
    if (!userId) return { success: false, error: '未登入' }
    
    const entriesWithWeek = entries.map(e => ({
      ...e,
      weekStart: weekStart.toISOString()
    }))
    
    const result = await TimeboxAPI.bulkCreateEntries(userId, entriesWithWeek)
    if (result.success) {
      await loadEntries()
    }
    return result
  }
  
  const createActivity = async (data: Partial<TimeboxActivity>) => {
    if (!userId) return { success: false, error: '未登入' }
    
    const result = await TimeboxAPI.createActivity(userId, data)
    if (result.success) {
      await loadEntries()
    }
    return result
  }
  
  const updateActivity = async (id: string, data: Partial<TimeboxActivity>) => {
    if (!userId) return { success: false, error: '未登入' }
    
    const result = await TimeboxAPI.updateActivity(userId, id, data)
    if (result.success) {
      await loadEntries()
    }
    return result
  }
  
  const deleteActivity = async (id: string) => {
    if (!userId) return { success: false, error: '未登入' }
    
    const result = await TimeboxAPI.deleteActivity(userId, id)
    if (result.success) {
      await loadEntries()
    }
    return result
  }
  
  useEffect(() => {
    loadEntries()
  }, [loadEntries])
  
  return {
    entries,
    activities,
    loading,
    error,
    loadEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    bulkCreateEntries,
    createActivity,
    updateActivity,
    deleteActivity
  }
}