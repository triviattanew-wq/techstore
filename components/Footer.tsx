import Link from 'next/link'
import { Phone, Mail, MapPin, Clock, Instagram, Send } from 'lucide-react'

const footerLinks = {
  catalog: [
    { name: 'Смартфоны', href: '/catalog/smartphones' },
    { name: 'Планшеты', href: '/catalog/tablets' },
    { name: 'Ноутбуки', href: '/catalog/laptops' },
    { name: 'Аудио', href: '/catalog/audio' },
    { name: 'Аксессуары', href: '/catalog/accessories' },
  ],
  services: [
    { name: 'Trade-in', href: '/trade-in' },
    { name: 'Проверка IMEI', href: '/imei-check' },
    { name: 'Доставка', href: '/delivery' },
    { name: 'Гарантия', href: '/warranty' },
  ],
  company: [
    { name: 'О компании', href: '/about' },
    { name: 'Контакты', href: '/contacts' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      {/* Main footer */}
      <div className="container-custom py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Brand & contacts */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="inline-block text-xl font-bold tracking-tight mb-4">
              TechStore
            </Link>
            <p className="text-gray-600 text-sm mb-6 max-w-xs">
              Интернет-магазин оригинальной электроники и гаджетов от Apple, Samsung и других ведущих брендов.
            </p>
            <div className="space-y-3 text-sm">
              <a href="tel:+78001234567" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <Phone className="w-4 h-4" />
                <span>8 (800) 123-45-67</span>
              </a>
              <a href="mailto:info@techstore.ru" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <Mail className="w-4 h-4" />
                <span>info@techstore.ru</span>
              </a>
              <span className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Москва, ул. Примерная, 1</span>
              </span>
              <span className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Пн-Вс: 10:00 - 21:00</span>
              </span>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Каталог</h3>
            <ul className="space-y-2">
              {footerLinks.catalog.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-gray-900">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Сервисы</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-gray-900">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Компания</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-gray-900">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Мы в соцсетях</h3>
            <div className="flex gap-2">
              <a
                href="https://t.me/techstore"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300 hover:text-gray-900 transition-colors"
              >
                <Send className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/techstore"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300 hover:text-gray-900 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200">
        <div className="container-custom py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} TechStore. Все права защищены.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-gray-900">
                Политика конфиденциальности
              </Link>
              <Link href="/terms" className="hover:text-gray-900">
                Пользовательское соглашение
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
