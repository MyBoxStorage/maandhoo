import React from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen bg-preto-profundo">
        <AdminSidebar />
        <main className="flex-1 ml-0 lg:ml-64 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </AdminAuthGuard>
  )
}
