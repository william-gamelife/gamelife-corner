import { BaseAPI, ApiResponse } from '@/lib/base-api'
import { TimeboxEntry, TimeboxActivity } from '@/lib/types'

export class TimeboxAPI {
  private static ENTRIES_MODULE = 'timebox_entries'
  private static ACTIVITIES_MODULE = 'timebox_activities'
  
  // 時間盒記錄
  static async getEntries(userId: string, weekStart?: string): Promise<TimeboxEntry[]> {
    const allEntries = await BaseAPI.loadData<TimeboxEntry>(this.ENTRIES_MODULE, userId, [])
    if (weekStart) {
      return allEntries.filter(entry => entry.weekStart === weekStart)
    }
    return allEntries
  }
  
  static async createEntry(userId: string, data: Partial<TimeboxEntry>): Promise<ApiResponse<TimeboxEntry>> {
    return BaseAPI.create<TimeboxEntry>(this.ENTRIES_MODULE, userId, data)
  }
  
  static async updateEntry(userId: string, id: string, data: Partial<TimeboxEntry>): Promise<ApiResponse<TimeboxEntry>> {
    return BaseAPI.update<TimeboxEntry>(this.ENTRIES_MODULE, userId, id, data)
  }
  
  static async deleteEntry(userId: string, id: string): Promise<ApiResponse<void>> {
    return BaseAPI.delete(this.ENTRIES_MODULE, userId, id)
  }
  
  // 活動類型
  static async getActivities(userId: string): Promise<TimeboxActivity[]> {
    return BaseAPI.loadData<TimeboxActivity>(this.ACTIVITIES_MODULE, userId, [])
  }
  
  static async createActivity(userId: string, data: Partial<TimeboxActivity>): Promise<ApiResponse<TimeboxActivity>> {
    return BaseAPI.create<TimeboxActivity>(this.ACTIVITIES_MODULE, userId, data)
  }
  
  static async updateActivity(userId: string, id: string, data: Partial<TimeboxActivity>): Promise<ApiResponse<TimeboxActivity>> {
    return BaseAPI.update<TimeboxActivity>(this.ACTIVITIES_MODULE, userId, id, data)
  }
  
  static async deleteActivity(userId: string, id: string): Promise<ApiResponse<void>> {
    return BaseAPI.delete(this.ACTIVITIES_MODULE, userId, id)
  }
  
  // Timebox 特有方法
  static calculateDuration(entries: TimeboxEntry[]): number {
    return entries.reduce((total, entry) => total + (entry.duration || 30), 0)
  }
}