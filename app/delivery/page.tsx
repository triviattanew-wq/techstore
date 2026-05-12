import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Truck, MapPin, Clock, CreditCard, ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Доставка',
  description: 'Информация о доставке товаров по Москве и России.',
}

export default async function DeliveryPage() {
  const page = await prisma.page.findUnique({
    where: { slug: 'delivery' },
  })

  const deliveryMethods = [
    {
      icon: MapPin,
      title: 'Самовывоз',
      price: 'Бесплатно',
      time: '1-2 дня',
      description: 'Заберите заказ в нашем магазине',
    },
    {
      icon: Truck,
      title: 'Доставка по Москве',
      price: 'от 300 ₽',
      time: '1-2 дня',
      description: 'Доставка курьером до двери',
    },
    {
      icon: Truck,
      title: 'Доставка по МО',
      price: 'от 500 ₽',
      time: '2-3 дня',
      description: 'Доставка за МКАД и по области',
    },
    {
      icon: Truck,
      title: 'Доставка по России',
      price: 'от 500 ₽',
      time: 'от 3 дней',
      description: 'СДЭК, Почта России',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="container-custom py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Доставка</h1>

            {/* Delivery methods */}
            <div className="grid md:grid-cols-2 gap-4 mb-12">
              {deliveryMethods.map((method, i) => (
                <div key={i} className="bg-white rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary-100 rounded-xl">
                      <method.icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-semibold mb-1">{method.title}</h2>
                      <p className="text-gray-500 text-sm mb-2">{method.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium">{method.price}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">{method.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional info */}
            <div className="bg-white rounded-2xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  Сроки доставки
                </h2>
                <p className="text-gray-600">
                  Срок доставки начинается с момента подтверждения заказа менеджером. 
                  При оформлении заказа до 14:00 доставка возможна на следующий день.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  Оплата
                </h2>
                <p className="text-gray-600">
                  Оплата производится при получении заказа наличными или банковской картой.
                  Возможна безналичная оплата для юридических лиц.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary-600" />
                  Гарантия
                </h2>
                <p className="text-gray-600">
                  Вся техника имеет официальную гарантию производителя. 
                  Гарантийное обслуживание осуществляется в авторизованных сервисных центрах.
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
