// ========== 基礎類型 ==========
export interface BaseModel {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
  syncStatus?: 'local' | 'synced' | 'pending' | 'conflict'
}

// ========== Todo 相關類型 ==========
export interface Todo extends BaseModel {
  title: string
  description?: string
  completed?: boolean
  status: 'backlog' | 'doing' | 'done'
  priority?: 'low' | 'medium' | 'high'
  tags?: string[]
  dueDate?: string
  order?: number
}

// ========== Project 相關類型 ==========
export interface ProjectTask extends BaseModel {
  title: string
  description?: string
  status: 'backlog' | 'doing' | 'done'
  priority?: 'low' | 'medium' | 'high'
  assignee?: string
  dueDate?: string
  order?: number
}

export interface Project extends BaseModel {
  name: string
  description: string
  status: 'planning' | 'active' | 'completed' | 'archived'
  startDate?: string
  endDate?: string
  progress: number
  tasks?: ProjectTask[]
  order?: number
}

// ========== Timebox 相關類型 ==========
export interface TimeboxEntry extends BaseModel {
  day: number
  hour: number
  minute?: number
  activity: string
  category: 'timing' | 'workout' | 'other'
  color: string
  completed?: boolean
  duration?: number
  weekStart: string
}

export interface TimeboxActivity extends BaseModel {
  name: string
  color: string
  category: 'timing' | 'workout' | 'other'
  description?: string
}

// ========== User 相關類型 ==========
export interface User extends BaseModel {
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'user'
  settings?: UserSettings
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: 'zh-TW' | 'en-US'
  notifications: boolean
  timezone: string
}