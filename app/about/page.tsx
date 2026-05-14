import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Package, Shield, Truck, Award } from 'lucide-react'

export const metadata = {
  title: 'О компании - TechStore',
  description: 'TechStore - надежный интернет-магазин оригинальной электроники и гаджетов',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-white">
        <div className="container-custom py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">О компании TechStore</h1>

          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-6">
              TechStore — это современный интернет-магазин оригинальной электроники и гаджетов от ведущих мировых производителей. Мы специализируемся на продаже смартфонов, планшетов, ноутбуков, наушников и аксессуаров премиум-класса.
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-gray-50 p-6 rounded-xl">
                <Package className="w-10 h-10 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Оригинальная продукция</h3>
                <p className="text-gray-600">
                  Мы работаем только с официальными поставщиками и гарантируем подлинность всех товаров.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <Shield className="w-10 h-10 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Официальная гарантия</h3>
                <p className="text-gray-600">
                  На все товары предоставляется официальная гарантия производителя от 1 года.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <Truck className="w-10 h-10 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Быстрая доставка</h3>
                <p className="text-gray-600">
                  Доставляем заказы по всей России. Курьерская доставка по Москве — в день заказа.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <Award className="w-10 h-10 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Trade-in программа</h3>
                <p className="text-gray-600">
                  Обменяйте старое устройство на новое с выгодой до 50 000 рублей.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">Наши преимущества</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">✓</span>
                <span>Широкий ассортимент техники от Apple, Samsung и других ведущих брендов</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">✓</span>
                <span>Конкурентные цены и регулярные акции</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">✓</span>
                <span>Профессиональная консультация специалистов</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">✓</span>
                <span>Удобные способы оплаты и рассрочка</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">✓</span>
                <span>Проверка IMEI и серийных номеров устройств Apple</span>
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Контакты</h2>
            <div className="bg-gray-50 p-6 rounded-xl">
              <p className="mb-2"><strong>Телефон:</strong> 8 (800) 123-45-67</p>
              <p className="mb-2"><strong>Email:</strong> info@techstore.ru</p>
              <p className="mb-2"><strong>Адрес:</strong> Москва, ул. Примерная, 1</p>
              <p><strong>Режим работы:</strong> Пн-Вс: 10:00 - 21:00</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
