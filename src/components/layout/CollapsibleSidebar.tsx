'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

interface MenuItem {
  title: string
  icon: string
  href: string
  role?: string[]
}

interface CollapsibleSidebarProps {
  userRole: string
}

export default function CollapsibleSidebar({ userRole }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved) {
      setIsCollapsed(JSON.parse(saved))
    }
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState))
  }

  const menuItems: MenuItem[] = [
    { title: '系統總覽', icon: '🏠', href: '/dashboard' },
    { title: '待辦事項', icon: '✓', href: '/dashboard/todos' },
    { title: '專案管理', icon: '📁', href: '/dashboard/projects' },
    { title: '箱型時間', icon: '⏰', href: '/dashboard/timebox' },
    { title: '用戶管理', icon: '👤', href: '/dashboard/users', role: ['SUPER_ADMIN', 'BUSINESS_ADMIN'] },
    { title: '系統設定', icon: '⚙️', href: '/dashboard/settings' },
  ]

  const filteredItems = menuItems.filter(item => 
    !item.role || item.role.includes(userRole)
  )

  return (
    <>
      <aside 
        className={`
          fixed left-0 top-0 h-full bg-white shadow-lg
          transition-all duration-300 ease-in-out z-40
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-8 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-primary-600 transition-colors"
        >
          {isCollapsed ? '→' : '←'}
        </button>

        <div className="p-4 border-b border-gray-200">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <span className="text-2xl">🎮</span>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-gray-800">GameLife</h2>
                <p className="text-xs text-gray-500">管理系統</p>
              </div>
            )}
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {filteredItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center p-3 rounded-lg transition-all
                      ${isCollapsed ? 'justify-center' : 'gap-3'}
                      ${isActive 
                        ? 'bg-primary bg-opacity-10 text-primary' 
                        : 'hover:bg-gray-100 text-gray-700'
                      }
                    `}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="font-medium">{item.title}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button
            onClick={() => {
              localStorage.removeItem('currentUser')
              router.push('/')
            }}
            className={`
              w-full flex items-center p-3 rounded-lg
              bg-red-50 text-red-600 hover:bg-red-100 transition-all
              ${isCollapsed ? 'justify-center' : 'gap-3'}
            `}
            title={isCollapsed ? '登出' : undefined}
          >
            <span className="text-xl">🚪</span>
            {!isCollapsed && (
              <span className="font-medium">登出</span>
            )}
          </button>
        </div>
      </aside>

      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`} />
    </>
  )
}