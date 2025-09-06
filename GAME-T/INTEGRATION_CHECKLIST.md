# CORNER-GAMELIFE 整合檢查清單

## ✅ 框架建立完成
- [x] BaseAPI 基礎層
- [x] ProjectAPI 模組
- [x] TimeboxAPI 模組
- [x] FinanceAPI 模組（預留）
- [x] 類型定義完整
- [x] API 統一匯出
- [x] Custom Hooks 層
- [x] Loading/Error 元件

## 📋 待整合頁面
- [ ] `/dashboard/todos` - 使用 useTodos hook
- [ ] `/dashboard/projects` - 使用 useProjects hook
- [ ] `/dashboard/timebox` - 使用 useTimebox hook
- [ ] `/dashboard/finance` - 使用 useFinance hook（待建立）

## 🧪 測試項目（最後執行）
- [ ] 登入功能正常
- [ ] Todos CRUD 操作
- [ ] Projects 建立與拖拽
- [ ] Timebox 活動管理
- [ ] 資料持久化驗證
- [ ] 跨頁面資料同步

## 📝 資料遷移
- [ ] 執行 npm run migrate
- [ ] 驗證舊資料是否保留
- [ ] 確認新格式正確

## 🔍 驗證指令
```javascript
// 在 Console 執行
// 1. 檢查用戶
JSON.parse(localStorage.getItem('currentUser'))

// 2. 檢查各模組資料
const userId = JSON.parse(localStorage.getItem('currentUser')).id
console.log('Todos:', localStorage.getItem(`gamelife_todos_${userId}`))
console.log('Projects:', localStorage.getItem(`gamelife_projects_${userId}`))
console.log('Timebox Entries:', localStorage.getItem(`gamelife_timebox_entries_${userId}`))
console.log('Timebox Activities:', localStorage.getItem(`gamelife_timebox_activities_${userId}`))
```

## 🎯 Hook 使用方式

### 1. Todos 頁面整合
```typescript
import { useTodos } from '@/hooks/useTodos'
import { Loading } from '@/components/Loading'
import { ErrorMessage } from '@/components/ErrorMessage'

const { todos, loading, error, createTodo, updateStatus } = useTodos()
```

### 2. Projects 頁面整合
```typescript
import { useProjects } from '@/hooks/useProjects'
import { Loading } from '@/components/Loading'
import { ErrorMessage } from '@/components/ErrorMessage'

const { projects, loading, error, createProject, updateOrder } = useProjects()
```

### 3. Timebox 頁面整合
```typescript
import { useTimebox } from '@/hooks/useTimebox'

const { entries, activities, loading, error, createEntry } = useTimebox(weekStart)
```

## 📦 可用的 Hooks

### useAuth
- `user` - 當前用戶
- `userId` - 用戶 ID  
- `loading` - 載入狀態
- `isAuthenticated` - 是否已登入

### useTodos  
- `todos` - 待辦事項列表
- `loading` - 載入狀態
- `error` - 錯誤訊息
- `createTodo()` - 建立待辦事項
- `updateTodo()` - 更新待辦事項
- `deleteTodo()` - 刪除待辦事項
- `toggleComplete()` - 切換完成狀態
- `updateStatus()` - 更新狀態
- `bulkUpdateStatus()` - 批量更新狀態

### useProjects
- `projects` - 專案列表
- `loading` - 載入狀態  
- `error` - 錯誤訊息
- `createProject()` - 建立專案
- `updateProject()` - 更新專案
- `deleteProject()` - 刪除專案
- `updateProgress()` - 更新進度
- `updateOrder()` - 更新排序

### useTimebox
- `entries` - 時間盒記錄
- `activities` - 活動類型
- `loading` - 載入狀態
- `error` - 錯誤訊息  
- `createEntry()` - 建立記錄
- `updateEntry()` - 更新記錄
- `deleteEntry()` - 刪除記錄
- `bulkCreateEntries()` - 批量建立
- `createActivity()` - 建立活動類型
- `updateActivity()` - 更新活動類型
- `deleteActivity()` - 刪除活動類型

## 🛠️ 通用元件

### Loading
```typescript
<Loading message="載入中..." />
```

### ErrorMessage
```typescript
<ErrorMessage error={error} onRetry={retryFunction} />
```

## 🚀 下一步行動

1. **選擇一個頁面開始整合**（建議從 Todos 開始）
2. **導入對應的 Hook 和元件**
3. **替換原有的狀態管理邏輯**
4. **測試 CRUD 功能**
5. **重複上述流程整合其他頁面**

## ⚡ 快速啟動指令

```bash
# 檢查環境
npm run check

# 清理備份
npm run clean:backup
```

---

**🎯 目標**: 讓所有頁面都使用統一的 Hook 架構，提供一致的用戶體驗和開發體驗！