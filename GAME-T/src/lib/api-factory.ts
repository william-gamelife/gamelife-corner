// API 工廠 - 統一管理所有 API 實例
// import { TodoAPI } from './api/TodoAPI'
// import { StatusTodoAPI } from './api/StatusTodoAPI'
// import { UnifiedTodoAPI } from './api/UnifiedTodoAPI'
import { ProjectAPI } from './api/ProjectAPI'
import { TimeboxAPI } from './api/TimeboxAPI'
import { FinanceAPI } from './api/FinanceAPI'

export const API = {
  // todos: TodoAPI,
  // statusTodos: StatusTodoAPI,
  // unifiedTodos: UnifiedTodoAPI,
  projects: ProjectAPI,
  timebox: TimeboxAPI,
  finance: FinanceAPI
}

// 方便的 helper function
export function getAPI(module: keyof typeof API) {
  return API[module]
}