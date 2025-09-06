import { useState, useEffect, useCallback } from 'react'
// Note: Import will need to be created when StatusTodoAPI is available
// import { StatusTodoAPI } from '@/lib/api/StatusTodoAPI'
import { Todo } from '@/lib/types'
import { useAuth } from './useAuth'

export function useTodos() {
  const { userId } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const loadTodos = useCallback(async () => {
    if (!userId) return
    
    setLoading(true)
    setError(null)
    try {
      // For now, simulate loading from localStorage until StatusTodoAPI is available
      const key = `gamelife_todos_${userId}`
      const data = localStorage.getItem(key)
      const parsedTodos = data ? JSON.parse(data) : []
      setTodos(parsedTodos)
      
      // TODO: Replace with actual API call when available
      // const data = await StatusTodoAPI.getAll(userId)
      // setTodos(data)
    } catch (err) {
      setError('載入待辦事項失敗')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [userId])
  
  const createTodo = async (data: Partial<Todo>) => {
    if (!userId) return { success: false, error: '未登入' }
    
    try {
      // Simulate creating todo
      const newTodo: Todo = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        title: data.title || '',
        description: data.description || '',
        status: data.status || 'backlog',
        completed: data.completed || false,
        priority: data.priority || 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const updatedTodos = [...todos, newTodo]
      setTodos(updatedTodos)
      localStorage.setItem(`gamelife_todos_${userId}`, JSON.stringify(updatedTodos))
      
      return { success: true, data: newTodo }
      
      // TODO: Replace with actual API call when available
      // const result = await StatusTodoAPI.create(userId, data)
      // if (result.success) {
      //   await loadTodos()
      // }
      // return result
    } catch (err) {
      return { success: false, error: '建立待辦事項失敗' }
    }
  }
  
  const updateTodo = async (id: string, data: Partial<Todo>) => {
    if (!userId) return { success: false, error: '未登入' }
    
    try {
      const updatedTodos = todos.map(todo =>
        todo.id === id ? { ...todo, ...data, updatedAt: new Date().toISOString() } : todo
      )
      setTodos(updatedTodos)
      localStorage.setItem(`gamelife_todos_${userId}`, JSON.stringify(updatedTodos))
      
      return { success: true }
      
      // TODO: Replace with actual API call when available
      // const result = await StatusTodoAPI.update(userId, id, data)
      // if (result.success) {
      //   await loadTodos()
      // }
      // return result
    } catch (err) {
      return { success: false, error: '更新待辦事項失敗' }
    }
  }
  
  const deleteTodo = async (id: string) => {
    if (!userId) return { success: false, error: '未登入' }
    
    try {
      const updatedTodos = todos.filter(todo => todo.id !== id)
      setTodos(updatedTodos)
      localStorage.setItem(`gamelife_todos_${userId}`, JSON.stringify(updatedTodos))
      
      return { success: true }
      
      // TODO: Replace with actual API call when available
      // const result = await StatusTodoAPI.delete(userId, id)
      // if (result.success) {
      //   await loadTodos()
      // }
      // return result
    } catch (err) {
      return { success: false, error: '刪除待辦事項失敗' }
    }
  }
  
  const toggleComplete = async (id: string) => {
    if (!userId) return { success: false, error: '未登入' }
    
    const todo = todos.find(t => t.id === id)
    if (!todo) return { success: false, error: '找不到待辦事項' }
    
    const newStatus = todo.completed ? 'backlog' : 'done'
    return updateTodo(id, { completed: !todo.completed, status: newStatus })
  }
  
  const updateStatus = async (id: string, status: Todo['status']) => {
    if (!userId) return { success: false, error: '未登入' }
    
    const completed = status === 'done'
    return updateTodo(id, { status, completed })
  }
  
  const bulkUpdateStatus = async (ids: string[], status: Todo['status']) => {
    if (!userId) return { success: false, error: '未登入' }
    
    try {
      const completed = status === 'done'
      const updatedTodos = todos.map(todo =>
        ids.includes(todo.id) 
          ? { ...todo, status, completed, updatedAt: new Date().toISOString() }
          : todo
      )
      setTodos(updatedTodos)
      localStorage.setItem(`gamelife_todos_${userId}`, JSON.stringify(updatedTodos))
      
      return { success: true }
      
      // TODO: Replace with actual API call when available
      // const result = await StatusTodoAPI.bulkUpdateStatus(userId, ids, status)
      // if (result.success) {
      //   await loadTodos()
      // }
      // return result
    } catch (err) {
      return { success: false, error: '批量更新失敗' }
    }
  }
  
  useEffect(() => {
    loadTodos()
  }, [loadTodos])
  
  return {
    todos,
    loading,
    error,
    loadTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    updateStatus,
    bulkUpdateStatus
  }
}