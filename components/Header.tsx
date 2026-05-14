'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { 
  Search, 
  Heart, 
  Scale, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  ChevronDown,
  Phone,
  Clock,
  MapPin,
  LogOut,
  Settings,
  Package
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'

const categories = [
  { name: 'iPhone', slug: 'iphone' },
  { name: 'iPad', slug: 'ipad' },
  { name: 'MacBook', slug: 'macbook' },
  { name: 'AirPods', slug: 'airpods' },
  { name: 'Аксессуары', slug: 'accessories' },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const { data: session } = useSession()
  const { totalItems } = useCart()
  const pathname = usePathname()

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 transition-colors duration-200">
      {/* Top bar */}
      <div className="hidden md:block bg-gray-50 border-b border-gray-100">
        <div className="container-custom">
          <div className="flex items-center justify-between h-10 text-sm text-gray-600">
            <div className="flex items-center gap-6">
              <a href="tel:+78001234567" className="flex items-center gap-1.5 hover:text-gray-900">
                <Phone className="w-3.5 h-3.5" />
                <span>8 (800) 123-45-67</span>
              </a>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Пн-Вс: 10:00 - 21:00</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Москва, ул. Примерная, 1</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/delivery" className="hover:text-gray-900">Доставка</Link>
              <Link href="/warranty" className="hover:text-gray-900">Гарантия</Link>
              <Link href="/trade-in" className="hover:text-gray-900">Trade-in</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 -ml-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl md:text-2xl font-bold tracking-tight">TechStore</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-colors",
                pathname === "/"
                  ? "text-gray-900 bg-gray-100"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              Главная
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/catalog/${cat.slug}`}
                className={cn(
                  "flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-colors",
                  pathname.startsWith(`/catalog/${cat.slug}`)
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Search */}
            <button
              className="p-2 md:p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Favorites */}
            <Link
              href="/favorites"
              className="hidden md:flex p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Compare */}
            <Link
              href="/compare"
              className="hidden md:flex p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Scale className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 md:p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* User */}
            {session ? (
              <div className="relative group">
                <button className="p-2 md:p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                  <User className="w-5 h-5" />
                </button>
                <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-2 min-w-[200px]">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                      <p className="text-xs text-gray-500">{session.user?.email}</p>
                    </div>
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                      <User className="w-4 h-4" />
                      Личный кабинет
                    </Link>
                    <Link href="/profile/orders" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                      <Package className="w-4 h-4" />
                      Мои заявки
                    </Link>
                    <Link href="/favorites" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                      <Heart className="w-4 h-4" />
                      Избранное
                    </Link>
                    <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                      <Settings className="w-4 h-4" />
                      Настройки
                    </Link>
                    <hr className="my-2 border-gray-100" />
                    <button
                      onClick={() => signOut()}
                      className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Выйти
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                <User className="w-5 h-5" />
                <span>Войти</span>
              </Link>
            )}
          </div>
        </div>

        {/* Search bar */}
        {isSearchOpen && (
          <div className="absolute left-0 right-0 top-full bg-white border-b border-gray-100 shadow-lg">
            <div className="container-custom py-4">
              <form action="/search" method="get" className="flex gap-3">
                <input
                  type="text"
                  name="q"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по каталогу..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
                <button type="submit" className="btn-primary">
                  Найти
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full bg-white border-b border-gray-100 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="container-custom py-4">
            <Link
              href="/"
              className="flex items-center justify-between py-3 font-medium border-b border-gray-100"
            >
              Главная
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/catalog/${cat.slug}`}
                className="flex items-center justify-between py-3 font-medium border-b border-gray-100 last:border-0"
              >
                {cat.name}
              </Link>
            ))}
            <div className="pt-4 space-y-3">
              <Link href="/delivery" className="block py-2 text-gray-600">Доставка</Link>
              <Link href="/warranty" className="block py-2 text-gray-600">Гарантия</Link>
              <Link href="/trade-in" className="block py-2 text-gray-600">Trade-in</Link>
              <Link href="/contacts" className="block py-2 text-gray-600">Контакты</Link>
            </div>
            {!session && (
              <div className="pt-4 mt-4 border-t border-gray-100">
                <Link href="/login" className="btn-primary w-full">
                  Войти
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
