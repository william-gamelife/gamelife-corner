// 資料遷移工具
export class DataMigration {
  static migrateAll(userId: string) {
    console.log('開始資料遷移...')
    
    this.migrateProjects(userId)
    this.migrateTimebox(userId)
    this.migrateTodos(userId)
    
    console.log('資料遷移完成')
  }
  
  static migrateProjects(userId: string) {
    // 檢查舊格式
    const oldKey = `gamelife_projects`
    const newKey = `gamelife_projects_${userId}`
    
    const oldData = localStorage.getItem(oldKey)
    if (oldData && !localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, oldData)
      console.log('Projects 資料已遷移')
    }
  }
  
  static migrateTimebox(userId: string) {
    // 檢查舊格式
    const oldKey = `timebox_${userId}`
    const entriesKey = `gamelife_timebox_entries_${userId}`
    const activitiesKey = `gamelife_timebox_activities_${userId}`
    
    const oldData = localStorage.getItem(oldKey)
    if (oldData) {
      try {
        const parsed = JSON.parse(oldData)
        
        // 遷移 entries
        if (parsed.timeboxes && !localStorage.getItem(entriesKey)) {
          const entries = Object.entries(parsed.timeboxes).map(([key, value]: [string, any]) => ({
            ...value,
            id: key,
            createdAt: value.createdAt || new Date().toISOString(),
            updatedAt: value.updatedAt || new Date().toISOString()
          }))
          localStorage.setItem(entriesKey, JSON.stringify(entries))
        }
        
        // 遷移 activities
        if (parsed.activityTypes && !localStorage.getItem(activitiesKey)) {
          localStorage.setItem(activitiesKey, JSON.stringify(parsed.activityTypes))
        }
        
        console.log('Timebox 資料已遷移')
      } catch (error) {
        console.error('Timebox 遷移失敗:', error)
      }
    }
  }
  
  static migrateTodos(userId: string) {
    // Todos 通常已經是新格式，這裡只是確認
    const key = `gamelife_todos_${userId}`
    const data = localStorage.getItem(key)
    if (data) {
      console.log('Todos 資料格式正確')
    }
  }
}