import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ShieldCheck, RefreshCcw, Package, AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Гарантия',
  description: 'Информация о гарантии и возврате товаров.',
}

export default async function WarrantyPage() {
  const page = await prisma.page.findUnique({
    where: { slug: 'warranty' },
  })

  const items = [
    {
      icon: ShieldCheck,
      title: 'Официальная гарантия',
      description: 'Вся техника сертифицирована и имеет официальную гарантию производителя от 1 года.',
    },
    {
      icon: RefreshCcw,
      title: 'Возврат 14 дней',
      description: 'Возврат товара надлежащего качества в течение 14 дней со дня покупки.',
    },
    {
      icon: Package,
      title: 'Гарантийный ремонт',
      description: 'Бесплатный ремонт в авторизованных сервисных центрах.',
    },
    {
      icon: AlertCircle,
      title: 'Поддержка',
      description: 'Консультация по вопросам гарантии по телефону 8 (800) 123-45-67.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="container-custom py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Гарантия и возврат</h1>

            <div className="grid md:grid-cols-2 gap-4 mb-12">
              {items.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary-100 rounded-xl">
                      <item.icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h2 className="font-semibold mb-1">{item.title}</h2>
                      <p className="text-gray-500 text-sm">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Возврат товара надлежащего качества</h2>
                <p className="text-gray-600">
                  Вы можете вернуть товар надлежащего качества в течение 14 дней со дня покупки.
                  Товар должен сохранить товарный вид, упаковку и комплектацию.
                  Для возврата потребуется документ, подтверждающий покупку.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Возврат товара ненадлежащего качества</h2>
                <p className="text-gray-600">
                  При обнаружении недостатков товара вы можете обратиться за гарантийным обслуживанием
                  в авторизованный сервисный центр или вернуть товар в магазин.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Технически сложные товары</h2>
                <p className="text-gray-600">
                  Технически сложные товары (смартфоны, ноутбуки, планшеты и др.) можно вернуть
                  при обнаружении недостатков в течение 15 дней со дня покупки.
                  После этого срока — только при наличии существенного недостатка.
                </p>
              </div>

              {page?.content && (
                <div dangerouslySetInnerHTML={{ __html: page.content }} />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
