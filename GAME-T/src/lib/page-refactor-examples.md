# 頁面改造範例

## 1. Todos 頁面改造範例
```typescript
// 原本的寫法
const [todos, setTodos] = useState<TodoItem[]>([])

const loadTodos = async () => {
  const apiTodos = await StatusTodoAPI.getAll(currentUser.id)
  setTodos(apiTodos)
}

const addTodo = async (title: string) => {
  const result = await StatusTodoAPI.create(currentUser.id, { title })
  if (result.success) {
    await loadTodos()
  }
}

// 改用 Hook 後
import { useTodos } from '@/hooks/useTodos'
import { Loading } from '@/components/Loading'
import { ErrorMessage } from '@/components/ErrorMessage'

export default function TodosPage() {
  const { todos, loading, error, createTodo, updateStatus, loadTodos } = useTodos()
  
  if (loading) return <Loading message="載入待辦事項中..." />
  if (error) return <ErrorMessage error={error} onRetry={loadTodos} />
  
  const handleAddTask = async () => {
    await createTodo({ title: newTask.title, status: 'backlog' })
  }
  
  const handleDrop = async (todoId: string, newStatus: string) => {
    await updateStatus(todoId, newStatus)
  }
  
  return (
    <div>
      {/* 你的 Todo UI */}
    </div>
  )
}
```

## 2. Projects 頁面改造範例
```typescript
// 改用 Hook 後
import { useProjects } from '@/hooks/useProjects'
import { Loading } from '@/components/Loading'
import { ErrorMessage } from '@/components/ErrorMessage'

export default function ProjectsPage() {
  const { projects, loading, error, createProject, updateOrder, loadProjects } = useProjects()
  
  if (loading) return <Loading message="載入專案中..." />
  if (error) return <ErrorMessage error={error} onRetry={loadProjects} />
  
  const handleCreateProject = async () => {
    await createProject({
      name: newProject.title,
      description: newProject.description,
      status: 'active',
      progress: 0
    })
  }
  
  const handleDrop = async (e, targetIndex) => {
    const newOrder = [...projects]
    // 重新排序邏輯
    await updateOrder(newOrder.map(p => p.id))
  }
  
  return (
    <div>
      {/* 你的 Project UI */}
    </div>
  )
}
```

## 3. Timebox 頁面改造範例
```typescript
// 改用 Hook 後
import { useTimebox } from '@/hooks/useTimebox'
import { Loading } from '@/components/Loading'
import { ErrorMessage } from '@/components/ErrorMessage'

export default function TimeboxPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date())
  const { 
    entries, 
    activities, 
    loading, 
    error, 
    createEntry, 
    createActivity, 
    loadEntries 
  } = useTimebox(currentWeekStart)
  
  if (loading) return <Loading message="載入時間盒中..." />
  if (error) return <ErrorMessage error={error} onRetry={loadEntries} />
  
  const setSlotActivity = async (slotId: string, activityId: string) => {
    const activity = activities.find(a => a.id === activityId)
    if (activity) {
      await createEntry({
        day: dayFromSlotId(slotId),
        hour: hourFromSlotId(slotId),
        activity: activity.name,
        color: activity.color,
        category: activity.category,
        duration: 30
      })
    }
  }
  
  const addActivityType = async (name: string, color: string, category: string) => {
    await createActivity({ name, color, category })
  }
  
  return (
    <div>
      {/* 你的 Timebox UI */}
    </div>
  )
}
```

## 4. 通用模式

### 基本頁面結構
```typescript
import { useXXX } from '@/hooks/useXXX'
import { Loading } from '@/components/Loading'
import { ErrorMessage } from '@/components/ErrorMessage'

export default function XXXPage() {
  const { data, loading, error, actions... } = useXXX()
  
  // 處理載入狀態
  if (loading) return <Loading message="載入中..." />
  
  // 處理錯誤狀態
  if (error) return <ErrorMessage error={error} onRetry={loadData} />
  
  // 正常渲染
  return <div>...</div>
}
```

### 表單提交模式
```typescript
const handleSubmit = async (formData) => {
  const result = await createItem(formData)
  if (result.success) {
    // 成功處理
    setShowModal(false)
    // Hook 會自動重新載入數據
  } else {
    // 錯誤處理
    setSubmitError(result.error)
  }
}
```

### 批量操作模式
```typescript
const handleBulkAction = async (selectedIds: string[], action: string) => {
  const result = await bulkUpdate(selectedIds, action)
  if (result.success) {
    setSelectedItems([])
    // Hook 會自動重新載入數據
  }
}
```

## 5. Hook 的優勢

1. **自動狀態管理**: loading、error 狀態自動處理
2. **統一錯誤處理**: 所有 API 錯誤統一處理
3. **自動重新載入**: CRUD 操作後自動更新列表
4. **類型安全**: 完整的 TypeScript 支援
5. **可重用性**: 多個頁面可以共用同一個 hook
6. **易於測試**: Hook 邏輯可以獨立測試

## 6. 遷移步驟

1. **導入 Hook**: `import { useXXX } from '@/hooks'`
2. **替換狀態**: 移除手動的 state 管理
3. **替換 API 調用**: 使用 Hook 提供的方法
4. **加入 Loading/Error**: 使用通用元件
5. **測試功能**: 確認 CRUD 操作正常