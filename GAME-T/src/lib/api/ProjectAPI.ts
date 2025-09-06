import { BaseAPI, ApiResponse } from '@/lib/base-api'
import { Project, ProjectTask } from '@/lib/types'

export class ProjectAPI {
  private static MODULE = 'projects'
  
  static async getAll(userId: string): Promise<Project[]> {
    return BaseAPI.loadData<Project>(this.MODULE, userId, [])
  }
  
  static async getById(userId: string, id: string): Promise<Project | null> {
    const projects = await this.getAll(userId)
    return projects.find(p => p.id === id) || null
  }
  
  static async create(userId: string, data: Partial<Project>): Promise<ApiResponse<Project>> {
    return BaseAPI.create<Project>(this.MODULE, userId, data)
  }
  
  static async update(userId: string, id: string, data: Partial<Project>): Promise<ApiResponse<Project>> {
    return BaseAPI.update<Project>(this.MODULE, userId, id, data)
  }
  
  static async delete(userId: string, id: string): Promise<ApiResponse<void>> {
    return BaseAPI.delete(this.MODULE, userId, id)
  }
  
  static async updateProgress(userId: string, projectId: string): Promise<ApiResponse<Project>> {
    const projects = await this.getAll(userId)
    const project = projects.find(p => p.id === projectId)
    
    if (project && project.tasks) {
      const completed = project.tasks.filter(t => t.status === 'done').length
      const progress = project.tasks.length > 0 
        ? Math.round((completed / project.tasks.length) * 100)
        : 0
      return this.update(userId, projectId, { progress })
    }
    
    return { success: false, error: 'Project not found' }
  }
  
  static async updateOrder(userId: string, projectIds: string[]): Promise<ApiResponse<Project[]>> {
    const projects = await this.getAll(userId)
    const orderedProjects = projectIds.map((id, index) => {
      const project = projects.find(p => p.id === id)
      if (project) {
        return { ...project, order: index }
      }
      return null
    }).filter(Boolean) as Project[]
    
    const saved = await BaseAPI.saveData(this.MODULE, userId, orderedProjects)
    return {
      success: saved.success,
      data: orderedProjects
    }
  }
}