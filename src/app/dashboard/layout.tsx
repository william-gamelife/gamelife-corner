'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authManager } from '@/lib/auth'
import CollapsibleSidebar from '@/components/layout/CollapsibleSidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = authManager.getCurrentUser()
    if (!user) {
      router.push('/')
      return
    }
    setCurrentUser(user)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">載入中...</div>
      </div>
    )
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleSidebar userRole={currentUser.role} />
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}