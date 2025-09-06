'use client'

import { useEffect, useState } from 'react'
import { authManager } from '@/lib/auth'
import { Project, ProjectTask } from '@/lib/types'
import { ProjectAPI } from '@/lib/api/ProjectAPI'

export default function ProjectsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [draggedProject, setDraggedProject] = useState<Project | null>(null)
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    template: 'travel-basic',
    members: [] as string[]
  })

  // 專案模板
  const projectTemplates = [
    {
      id: 'travel-basic',
      name: '旅行社基礎模板',
      categories: [
        { 
          id: 'contract', 
          name: '合約類',
          icon: 'M9 12h6m-6 4h6M9 8h6m-7-4h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z',
          tasks: [
            '合約簽署確認',
            '付款條件討論',
            '服務條款確認'
          ]
        },
        { 
          id: 'flight', 
          name: '機票類',
          icon: 'M12 19l7-7 3 3-7 7-3-3zM5 4l3 3-3 7 3-3 7 3-3-3z',
          tasks: [
            '機票價格查詢',
            '航班時間確認',
            '機票預訂'
          ]
        },
        { 
          id: 'hotel', 
          name: '住宿類',
          icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16M12 3v18M5 9h14M5 13h14',
          tasks: [
            '飯店選擇與比較',
            '房型確認',
            '住宿預訂'
          ]
        },
        { 
          id: 'transport', 
          name: '交通類',
          icon: 'M7 17m-2 0a2 2 0 104 0 2 2 0 10-4 0M17 17m-2 0a2 2 0 104 0 2 2 0 10-4 0M5 17H3v-6l2-5h9l4 5v6h-2',
          tasks: [
            '當地交通安排',
            '接送服務確認',
            '交通路線規劃'
          ]
        }
      ]
    },
    {
      id: 'travel-full',
      name: '旅行社完整模板',
      categories: [
        { 
          id: 'contract', 
          name: '合約類',
          icon: 'M9 12h6m-6 4h6M9 8h6m-7-4h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z',
          tasks: ['合約簽署確認', '付款條件討論', '服務條款確認', '保險條款確認']
        },
        { 
          id: 'flight', 
          name: '機票類',
          icon: 'M12 19l7-7 3 3-7 7-3-3zM5 4l3 3-3 7 3-3 7 3-3-3z',
          tasks: ['機票價格查詢', '航班時間確認', '機票預訂', '座位安排']
        },
        { 
          id: 'hotel', 
          name: '住宿類',
          icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16M12 3v18M5 9h14M5 13h14',
          tasks: ['飯店選擇與比較', '房型確認', '住宿預訂', '特殊需求安排']
        },
        { 
          id: 'activity', 
          name: '活動類',
          icon: 'M13 10V3L4 14h7v7l9-11h-7z',
          tasks: ['景點門票預訂', '導遊安排', '活動行程確認']
        },
        { 
          id: 'meal', 
          name: '餐飲類',
          icon: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z',
          tasks: ['餐廳預約', '特殊飲食安排', '團體用餐安排']
        }
      ]
    },
    {
      id: 'blank',
      name: '空白專案',
      categories: [
        { 
          id: 'general', 
          name: '一般任務',
          icon: 'M9 12h6m-6 4h6M9 8h6m-7-4h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z',
          tasks: []
        }
      ]
    }
  ]

  // 動態獲取有專案權限的用戶
  const loadAvailableUsers = async () => {
    try {
      const allUsers = authManager.getAllUsers()
      // 過濾有專案權限的用戶
      const usersWithProjectPermission = allUsers.filter(user => 
        user.permissions?.projects === true
      )
      setAvailableUsers(usersWithProjectPermission)
    } catch (error) {
      console.error('載入用戶列表失敗:', error)
    }
  }

  useEffect(() => {
    const user = authManager.getCurrentUser()
    setCurrentUser(user)
    
    if (!user) return

    loadProjects()
    loadAvailableUsers()
  }, [])

  const loadProjects = async () => {
    try {
      const userId = authManager.getUserId()
      const storedProjects = await ProjectAPI.getAll(userId)
      if (storedProjects.length > 0) {
        setProjects(storedProjects)
      } else {
        // 初始化示例專案
        const initialProjects: Project[] = [
          {
            id: generateId(),
            title: '台灣環島五日遊',
            description: '客戶家庭旅遊專案',
            status: 'active',
            startDate: new Date().toISOString(),
            members: ['william', 'amy'],
            tasks: [
              {
                id: generateId(),
                projectId: '',
                title: '合約簽署確認',
                status: 'done',
                assignee: 'william',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: generateId(),
                projectId: '',
                title: '機票價格查詢',
                status: 'in-progress',
                assignee: 'amy',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ],
            progress: 30,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
        // 更新任務的 projectId
        initialProjects.forEach(project => {
          project.tasks?.forEach(task => {
            task.projectId = project.id
          })
        })
        setProjects(initialProjects)
        saveProjects(initialProjects)
      }
    } catch (error) {
      console.error('載入專案失敗:', error)
    }
  }

  const saveProjects = async (projectsToSave: Project[]) => {
    try {
      // 注意：由於新架構使用個別的 create/update/delete 操作
      // 這個函數主要用於初始化，實際使用時應該改為個別操作
      const userId = authManager.getUserId()
      for (const project of projectsToSave) {
        if (!projects.find(p => p.id === project.id)) {
          // 新專案
          await ProjectAPI.create(userId, project)
        }
      }
      setProjects(projectsToSave)
    } catch (error) {
      console.error('儲存專案失敗:', error)
    }
  }

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev)
      if (newSet.has(projectId)) {
        newSet.delete(projectId)
      } else {
        newSet.add(projectId)
      }
      return newSet
    })
  }

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey)
      } else {
        newSet.add(categoryKey)
      }
      return newSet
    })
  }

  const handleCreateProject = () => {
    if (!newProject.title.trim()) return

    const template = projectTemplates.find(t => t.id === newProject.template)
    if (!template) return

    const project: Project = {
      id: generateId(),
      title: newProject.title,
      description: newProject.description,
      status: 'active',
      startDate: new Date().toISOString(),
      members: newProject.members,
      tasks: template.categories.flatMap(category => 
        category.tasks.map(taskTitle => ({
          id: generateId(),
          projectId: '',
          title: taskTitle,
          status: 'todo' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))
      ),
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 更新任務的 projectId
    project.tasks?.forEach(task => {
      task.projectId = project.id
    })

    const updatedProjects = [...projects, project]
    setProjects(updatedProjects)
    saveProjects(updatedProjects)

    // 重置表單
    setNewProject({
      title: '',
      description: '',
      template: 'travel-basic',
      members: []
    })
    setShowCreateDialog(false)
  }

  const getProjectProgress = (project: Project) => {
    if (!project.tasks || project.tasks.length === 0) return 0
    const completedTasks = project.tasks.filter(t => t.status === 'done').length
    return Math.round((completedTasks / project.tasks.length) * 100)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981'
      case 'completed': return '#6b7280'
      case 'archived': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '進行中'
      case 'completed': return '已完成'
      case 'archived': return '已封存'
      default: return status
    }
  }

  // 拖拽處理
  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    
    if (!draggedProject) return

    const draggedIndex = projects.findIndex(p => p.id === draggedProject.id)
    if (draggedIndex === -1 || draggedIndex === targetIndex) return

    const newProjects = [...projects]
    const [removed] = newProjects.splice(draggedIndex, 1)
    newProjects.splice(targetIndex, 0, removed)

    setProjects(newProjects)
    saveProjects(newProjects)
    setDraggedProject(null)
  }

  if (!currentUser) {
    return (
      <div className="loading">
        正在載入專案管理...
      </div>
    )
  }

  if (!currentUser.permissions?.projects) {
    return (
      <div className="access-denied">
        <div className="access-denied-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2>權限不足</h2>
        <p>您沒有權限查看專案管理功能</p>
        <p className="sub-text">需要業務管理員以上權限</p>
      </div>
    )
  }

  const activeProjects = projects.filter(p => p.status === 'active')
  const completedProjects = projects.filter(p => p.status === 'completed')
  const allTasks = projects.flatMap(p => p.tasks || [])
  const pendingTasks = allTasks.filter(t => t.status === 'todo' || t.status === 'in-progress')

  return (
    <div className="projects-container">
      <div className="projects-header">
        <div className="header-left">
          <h1 className="projects-title">專案布告欄</h1>
          <div className="quick-stats">
            <span className="stat-badge active">{activeProjects.length} 進行中</span>
            <span className="stat-badge completed">{completedProjects.length} 已完成</span>
            <span className="stat-badge pending">{pendingTasks.length} 待處理</span>
          </div>
        </div>
        <button 
          className="create-project-btn"
          onClick={() => setShowCreateDialog(true)}
        >
          <svg viewBox="0 0 16 16" width="16" height="16">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          新增專案
        </button>
      </div>

      <div className="bulletin-hint">
        <svg viewBox="0 0 16 16" width="14" height="14">
          <path d="M8 1l2.09 3.26L14 5.39 11.27 8 14 10.61l-3.91 1.13L8 15l-2.09-3.26L2 10.61 4.73 8 2 5.39l3.91-1.13L8 1z" fill="currentColor"/>
        </svg>
        拖拽專案卡片可調整優先順序 • 等待客戶回應的專案可往後排
      </div>

      {/* 布告欄專案列表 */}
      <div className="bulletin-board">
        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3>專案布告欄空空如也</h3>
            <p>建立第一個專案，開始你的工作流程管理</p>
            <button 
              className="empty-action-btn"
              onClick={() => setShowCreateDialog(true)}
            >
              立即建立專案
            </button>
          </div>
        ) : (
          projects.map((project, index) => {
            const progress = getProjectProgress(project)
            const taskCount = project.tasks?.length || 0
            const completedTasks = project.tasks?.filter(t => t.status === 'done').length || 0
            
            return (
              <div 
                key={project.id} 
                className="bulletin-card"
                draggable
                onDragStart={(e) => handleDragStart(e, project)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                {/* 拖拽手柄 */}
                <div className="drag-handle">
                  <svg viewBox="0 0 16 16" width="12" height="12">
                    <circle cx="3" cy="3" r="1"/>
                    <circle cx="3" cy="8" r="1"/>
                    <circle cx="3" cy="13" r="1"/>
                    <circle cx="8" cy="3" r="1"/>
                    <circle cx="8" cy="8" r="1"/>
                    <circle cx="8" cy="13" r="1"/>
                  </svg>
                </div>

                {/* 專案狀態指示 */}
                <div 
                  className="status-indicator"
                  style={{ backgroundColor: getStatusBadgeColor(project.status) }}
                ></div>

                {/* 專案資訊 */}
                <div className="card-content">
                  <div className="card-header">
                    <h3 className="project-name">{project.title}</h3>
                    <span className="status-badge" style={{ color: getStatusBadgeColor(project.status) }}>
                      {getStatusText(project.status)}
                    </span>
                  </div>
                  
                  <p className="project-description">{project.description}</p>

                  <div className="project-meta">
                    <div className="progress-section">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${progress}%`,
                            backgroundColor: getStatusBadgeColor(project.status)
                          }}
                        ></div>
                      </div>
                      <span className="progress-text">{completedTasks}/{taskCount} 完成</span>
                    </div>

                    {project.members && project.members.length > 0 && (
                      <div className="members-list">
                        {project.members.slice(0, 3).map((memberId, idx) => {
                          const member = availableUsers.find(u => u.id === memberId)
                          return (
                            <div key={memberId} className="member-avatar" title={member?.display_name}>
                              {member?.display_name?.charAt(0) || '?'}
                            </div>
                          )
                        })}
                        {project.members.length > 3 && (
                          <div className="member-more">+{project.members.length - 3}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {project.startDate && (
                    <div className="project-date">
                      開始：{new Date(project.startDate).toLocaleDateString('zh-TW')}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 建立專案對話框 */}
      {showCreateDialog && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowCreateDialog(false)}>
          <div className="modal-content">
            <h3 className="modal-title">建立新專案</h3>
            
            <div className="form-group">
              <label>專案名稱</label>
              <input
                type="text"
                value={newProject.title}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                placeholder="輸入專案名稱"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>專案描述</label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                placeholder="輸入專案描述（選填）"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>專案模板</label>
              <select
                value={newProject.template}
                onChange={(e) => setNewProject({...newProject, template: e.target.value})}
              >
                {projectTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>團隊成員</label>
              <div className="members-selection">
                {availableUsers.map(user => (
                  <label key={user.id} className="member-checkbox">
                    <input
                      type="checkbox"
                      checked={newProject.members.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewProject({...newProject, members: [...newProject.members, user.id]})
                        } else {
                          setNewProject({...newProject, members: newProject.members.filter(id => id !== user.id)})
                        }
                      }}
                    />
                    <span>{user.display_name} ({user.role === 'SUPER_ADMIN' ? '系統管理員' : user.role === 'BUSINESS_ADMIN' ? '業務管理員' : '一般使用者'})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowCreateDialog(false)}
              >
                取消
              </button>
              <button 
                className="btn-primary" 
                onClick={handleCreateProject}
              >
                建立專案
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .projects-container {
          max-width: none;
          margin: 0 auto;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .projects-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 2px solid rgba(201, 169, 97, 0.2);
          margin-bottom: 16px;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .projects-title {
          font-size: 24px;
          font-weight: 700;
          color: #3a3833;
          margin: 0;
        }

        .quick-stats {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .stat-badge {
          background: rgba(255, 255, 255, 0.8);
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          border: 1px solid rgba(201, 169, 97, 0.2);
        }

        .stat-badge.active {
          color: #10b981;
          border-color: rgba(16, 185, 129, 0.3);
        }

        .stat-badge.completed {
          color: #6b7280;
          border-color: rgba(107, 114, 128, 0.3);
        }

        .stat-badge.pending {
          color: #f59e0b;
          border-color: rgba(245, 158, 11, 0.3);
        }

        .bulletin-hint {
          background: rgba(201, 169, 97, 0.1);
          border: 1px solid rgba(201, 169, 97, 0.2);
          border-radius: 8px;
          padding: 8px 12px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #8b7355;
        }

        .create-project-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .create-project-btn:before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transition: left 0.5s;
        }

        .create-project-btn:hover:before {
          left: 100%;
        }

        .create-project-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(201, 169, 97, 0.3);
        }

        .projects-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.8);
          padding: 24px;
          border-radius: 16px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          display: flex;
          align-items: center;
          gap: 16px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #c9a961, #e4d4a8);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(201, 169, 97, 0.2);
          border-color: rgba(201, 169, 97, 0.4);
        }

        .stat-card:hover:before {
          transform: scaleX(1);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-icon.active {
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
        }

        .stat-icon.completed {
          background: linear-gradient(135deg, #22c55e, #16a34a);
        }

        .stat-icon.pending {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #3a3833;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #6d685f;
          margin-top: 4px;
        }

        .projects-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          text-align: center;
          color: #6d685f;
        }

        .empty-state svg {
          margin-bottom: 16px;
          opacity: 0.6;
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          color: #3a3833;
        }

        .empty-state p {
          margin: 0;
          opacity: 0.8;
        }

        .project-card {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 16px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          overflow: hidden;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          position: relative;
        }

        .project-card:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(201, 169, 97, 0.1) 0%,
            rgba(228, 212, 168, 0.05) 50%,
            rgba(201, 169, 97, 0.1) 100%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .project-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 50px rgba(201, 169, 97, 0.2);
          border-color: rgba(201, 169, 97, 0.4);
        }

        .project-card:hover:before {
          opacity: 1;
        }

        .project-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(201, 169, 97, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          position: relative;
          z-index: 1;
        }

        .project-info {
          flex: 1;
        }

        .project-name {
          font-weight: 600;
          color: #3a3833;
          font-size: 1.1rem;
          margin-bottom: 4px;
        }

        .project-description {
          font-size: 0.9rem;
          color: #6d685f;
        }

        .project-progress {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.9rem;
          color: #6d685f;
        }

        .progress-text {
          font-weight: 600;
          color: #c9a961;
          min-width: 35px;
        }

        .progress-bar {
          width: 120px;
          height: 8px;
          background: rgba(201, 169, 97, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #c9a961, #e4d4a8);
          transition: width 0.3s ease;
          border-radius: 4px;
        }

        .expand-toggle {
          padding: 8px;
          background: rgba(201, 169, 97, 0.1);
          border: none;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s ease;
          color: #c9a961;
        }

        .expand-toggle:hover {
          background: rgba(201, 169, 97, 0.2);
          transform: scale(1.1);
        }

        .expand-toggle.expanded {
          transform: rotate(180deg);
        }

        .expand-toggle.expanded:hover {
          transform: rotate(180deg) scale(1.1);
        }

        .project-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .project-content.expanded {
          max-height: 1000px;
        }

        .category-block {
          border-bottom: 1px solid rgba(201, 169, 97, 0.1);
        }

        .category-block:last-child {
          border-bottom: none;
        }

        .category-header {
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .category-header:hover {
          background: rgba(201, 169, 97, 0.05);
        }

        .category-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .category-icon {
          width: 20px;
          height: 20px;
          color: #c9a961;
        }

        .category-name {
          font-weight: 500;
          color: #3a3833;
        }

        .category-count {
          background: rgba(201, 169, 97, 0.2);
          color: #8b7355;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
        }

        .category-toggle {
          padding: 4px;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s ease;
          color: #6d685f;
        }

        .category-toggle:hover {
          background: rgba(201, 169, 97, 0.1);
        }

        .category-toggle.expanded {
          transform: rotate(180deg);
        }

        .category-tasks {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .category-tasks.expanded {
          max-height: 500px;
        }

        .task-item {
          padding: 12px 24px 12px 56px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(201, 169, 97, 0.05);
          transition: background 0.2s ease;
        }

        .task-item:hover {
          background: rgba(201, 169, 97, 0.03);
        }

        .task-item:last-child {
          border-bottom: none;
        }

        .task-status {
          color: #6d685f;
        }

        .task-item.done .task-status {
          color: #22c55e;
        }

        .task-item.in-progress .task-status {
          color: #f59e0b;
        }

        .task-title {
          flex: 1;
          color: #3a3833;
          font-size: 14px;
        }

        .task-item.done .task-title {
          text-decoration: line-through;
          color: #6d685f;
        }

        .task-assignee {
          font-size: 12px;
          color: #6d685f;
          background: rgba(201, 169, 97, 0.1);
          padding: 2px 8px;
          border-radius: 8px;
        }

        .access-denied {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
          color: #6d685f;
        }

        .access-denied-icon {
          width: 64px;
          height: 64px;
          margin-bottom: 20px;
          color: #c9a961;
        }

        .access-denied h2 {
          margin: 0 0 8px 0;
          color: #3a3833;
          font-size: 1.5rem;
        }

        .sub-text {
          font-size: 0.9rem;
          margin-top: 8px;
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: #6d685f;
          font-size: 16px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          padding: 24px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-title {
          margin: 0 0 20px 0;
          color: #3a3833;
          font-size: 20px;
          font-weight: 600;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
          color: #3a3833;
          font-size: 14px;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 8px;
          font-size: 14px;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 60px;
        }

        .members-selection {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 150px;
          overflow-y: auto;
          padding: 8px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          border-radius: 8px;
          background: rgba(201, 169, 97, 0.05);
        }

        .member-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .member-checkbox:hover {
          background: rgba(201, 169, 97, 0.1);
        }

        .member-checkbox input {
          width: auto;
          margin: 0;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        .btn-secondary {
          padding: 10px 20px;
          border: 1px solid rgba(201, 169, 97, 0.3);
          background: white;
          border-radius: 8px;
          cursor: pointer;
          color: #6d685f;
        }

        .btn-primary {
          padding: 10px 20px;
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        /* 布告欄樣式 */
        .bulletin-board {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          padding: 4px;
        }

        .bulletin-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 16px;
          border: 2px solid rgba(201, 169, 97, 0.2);
          position: relative;
          cursor: grab;
          transition: all 0.3s ease;
          min-height: 180px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .bulletin-card:hover {
          transform: translateY(-4px) rotate(0.5deg);
          box-shadow: 0 8px 25px rgba(201, 169, 97, 0.2);
          border-color: rgba(201, 169, 97, 0.4);
        }

        .bulletin-card:active {
          cursor: grabbing;
          transform: rotate(2deg);
        }

        .drag-handle {
          position: absolute;
          top: 8px;
          right: 8px;
          color: #c9a961;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .bulletin-card:hover .drag-handle {
          opacity: 1;
        }

        .status-indicator {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          border-radius: 16px 16px 0 0;
        }

        .card-content {
          margin-top: 8px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .project-name {
          font-size: 18px;
          font-weight: 600;
          color: #3a3833;
          margin: 0;
          flex: 1;
          line-height: 1.3;
        }

        .status-badge {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid currentColor;
          margin-left: 8px;
          white-space: nowrap;
        }

        .project-description {
          font-size: 14px;
          color: #6d685f;
          line-height: 1.4;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .project-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .progress-section {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .progress-bar {
          flex: 1;
          height: 6px;
          background: rgba(201, 169, 97, 0.2);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 11px;
          font-weight: 500;
          color: #8b7355;
          white-space: nowrap;
        }

        .members-list {
          display: flex;
          gap: 4px;
        }

        .member-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .member-more {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(201, 169, 97, 0.2);
          color: #8b7355;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 600;
          border: 2px solid white;
        }

        .project-date {
          font-size: 11px;
          color: #8b7355;
          margin-top: 8px;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: #6d685f;
        }

        .empty-icon {
          margin: 0 auto 16px auto;
          color: #c9a961;
          opacity: 0.6;
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          color: #3a3833;
          font-size: 20px;
        }

        .empty-state p {
          margin: 0 0 20px 0;
          font-size: 16px;
        }

        .empty-action-btn {
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .empty-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(201, 169, 97, 0.3);
        }

        @media (max-width: 768px) {
          .bulletin-board {
            grid-template-columns: 1fr;
          }

          .projects-header {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }
          
          .header-left {
            align-items: center;
          }

          .quick-stats {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}