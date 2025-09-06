import { useState, useEffect, useCallback } from 'react'
import { ProjectAPI } from '@/lib/api/ProjectAPI'
import { Project } from '@/lib/types'
import { useAuth } from './useAuth'

export function useProjects() {
  const { userId } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const loadProjects = useCallback(async () => {
    if (!userId) return
    
    setLoading(true)
    setError(null)
    try {
      const data = await ProjectAPI.getAll(userId)
      setProjects(data)
    } catch (err) {
      setError('載入專案失敗')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [userId])
  
  const createProject = async (data: Partial<Project>) => {
    if (!userId) return { success: false, error: '未登入' }
    
    const result = await ProjectAPI.create(userId, data)
    if (result.success) {
      await loadProjects()
    }
    return result
  }
  
  const updateProject = async (id: string, data: Partial<Project>) => {
    if (!userId) return { success: false, error: '未登入' }
    
    const result = await ProjectAPI.update(userId, id, data)
    if (result.success) {
      await loadProjects()
    }
    return result
  }
  
  const deleteProject = async (id: string) => {
    if (!userId) return { success: false, error: '未登入' }
    
    const result = await ProjectAPI.delete(userId, id)
    if (result.success) {
      await loadProjects()
    }
    return result
  }
  
  const updateProgress = async (projectId: string) => {
    if (!userId) return { success: false, error: '未登入' }
    
    const result = await ProjectAPI.updateProgress(userId, projectId)
    if (result.success) {
      await loadProjects()
    }
    return result
  }
  
  const updateOrder = async (projectIds: string[]) => {
    if (!userId) return { success: false, error: '未登入' }
    
    const result = await ProjectAPI.updateOrder(userId, projectIds)
    if (result.success) {
      setProjects(result.data || [])
    }
    return result
  }
  
  useEffect(() => {
    loadProjects()
  }, [loadProjects])
  
  return {
    projects,
    loading,
    error,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    updateProgress,
    updateOrder
  }
}