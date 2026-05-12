'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FolderTree, 
  Image, 
  FileText, 
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const navItems = [
  { name: 'Дашборд', href: '/admin', icon: LayoutDashboard },
  { name: 'Товары', href: '/admin/products', icon: Package },
  { name: 'Заявки', href: '/admin/leads', icon: ShoppingCart },
  { name: 'Пользователи', href: '/admin/users', icon: Users },
  { name: 'Настройки', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Максимально простая проверка аутентификации
    try {
      let isLoggedIn = false
      
      if (typeof window !== 'undefined') {
        isLoggedIn = localStorage.getItem('admin_logged_in') === 'true'
      }
      
      setIsAuthenticated(isLoggedIn)
      setLoading(false)
      
      if (!isLoggedIn && pathname !== '/admin/login') {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setIsAuthenticated(false)
      setLoading(false)
      if (pathname !== '/admin/login') {
        router.push('/admin/login')
      }
    }
  }, [pathname, router])

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_logged_in')
      }
      setIsAuthenticated(false)
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/admin/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated && pathname !== '/admin/login') {
    return null
  }

  if (pathname === '/admin/login') {
    return children
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 transform transition-transform lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Link href="/admin" className="text-xl font-bold text-white">
            TechStore Admin
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-4">
              <Link href="/" target="_blank" className="text-sm text-gray-500 hover:text-gray-900">
                Открыть сайт →
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
