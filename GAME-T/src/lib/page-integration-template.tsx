// 頁面整合模板 - 供參考使用
import { useEffect, useState } from 'react'
import { authManager } from '@/lib/auth'
import { API } from '@/lib/api-factory'

// 範例：整合 Projects 頁面
export function useProjectsAPI() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  
  const loadProjects = async () => {
    setLoading(true)
    try {
      const userId = authManager.getUserId()
      const data = await API.projects.getAll(userId)
      setProjects(data)
    } catch (error) {
      console.error('載入失敗:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const createProject = async (data: any) => {
    const userId = authManager.getUserId()
    const result = await API.projects.create(userId, data)
    if (result.success) {
      await loadProjects()
    }
    return result
  }
  
  const updateProject = async (id: string, data: any) => {
    const userId = authManager.getUserId()
    const result = await API.projects.update(userId, id, data)
    if (result.success) {
      await loadProjects()
    }
    return result
  }
  
  const deleteProject = async (id: string) => {
    const userId = authManager.getUserId()
    const result = await API.projects.delete(userId, id)
    if (result.success) {
      await loadProjects()
    }
    return result
  }
  
  useEffect(() => {
    loadProjects()
  }, [])
  
  return {
    projects,
    loading,
    loadProjects,
    createProject,
    updateProject,
    deleteProject
  }
}

// 範例：整合 Timebox 頁面
export function useTimeboxAPI() {
  const [entries, setEntries] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  
  const loadData = async (weekStart?: string) => {
    setLoading(true)
    try {
      const userId = authManager.getUserId()
      const entriesData = await API.timebox.getEntries(userId, weekStart)
      const activitiesData = await API.timebox.getActivities(userId)
      setEntries(entriesData)
      setActivities(activitiesData)
    } catch (error) {
      console.error('載入失敗:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const createEntry = async (data: any) => {
    const userId = authManager.getUserId()
    const result = await API.timebox.createEntry(userId, data)
    if (result.success) {
      await loadData()
    }
    return result
  }
  
  const updateEntry = async (id: string, data: any) => {
    const userId = authManager.getUserId()
    const result = await API.timebox.updateEntry(userId, id, data)
    if (result.success) {
      await loadData()
    }
    return result
  }
  
  const deleteEntry = async (id: string) => {
    const userId = authManager.getUserId()
    const result = await API.timebox.deleteEntry(userId, id)
    if (result.success) {
      await loadData()
    }
    return result
  }
  
  return {
    entries,
    activities,
    loading,
    loadData,
    createEntry,
    updateEntry,
    deleteEntry
  }
}

// 範例：整合 Finance 頁面
export function useFinanceAPI() {
  const [records, setRecords] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  
  const loadData = async (startDate?: string, endDate?: string) => {
    setLoading(true)
    try {
      const userId = authManager.getUserId()
      const recordsData = await API.finance.getRecords(userId, startDate, endDate)
      const categoriesData = await API.finance.getCategories(userId)
      setRecords(recordsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('載入失敗:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const createRecord = async (data: any) => {
    const userId = authManager.getUserId()
    const result = await API.finance.createRecord(userId, data)
    if (result.success) {
      await loadData()
    }
    return result
  }
  
  const calculateBalance = () => {
    return API.finance.calculateBalance(records)
  }
  
  useEffect(() => {
    loadData()
  }, [])
  
  return {
    records,
    categories,
    loading,
    loadData,
    createRecord,
    calculateBalance
  }
}