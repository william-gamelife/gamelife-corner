import { BaseAPI, BaseModel, ApiResponse } from '@/lib/base-api'

export interface Project extends BaseModel {
  name: string
  description: string
  status: 'planning' | 'active' | 'completed' | 'archived'
  startDate?: string
  endDate?: string
  progress: number
}

export class ProjectAPI {
  private static MODULE = 'projects'
  
  static async getAll(userId: string): Promise<Project[]> {
    return BaseAPI.loadData<Project>(this.MODULE, userId, [])
  }
  
  static async create(userId: string, project: Partial<Project>): Promise<ApiResponse<Project>> {
    return BaseAPI.create<Project>(this.MODULE, userId, {
      ...project,
      status: project.status || 'planning',
      progress: project.progress || 0
    })
  }
  
  static async update(userId: string, id: string, updates: Partial<Project>): Promise<ApiResponse<Project>> {
    return BaseAPI.update<Project>(this.MODULE, userId, id, updates)
  }
  
  static async delete(userId: string, id: string): Promise<ApiResponse<void>> {
    return BaseAPI.delete<Project>(this.MODULE, userId, id)
  }
}