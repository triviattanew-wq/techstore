import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata = {
  title: 'Политика конфиденциальности',
  description: 'Политика обработки персональных данных.',
}

export default async function PrivacyPage() {
  const page = await prisma.page.findUnique({
    where: { slug: 'privacy' },
  })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="container-custom py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Политика конфиденциальности</h1>

            <div className="bg-white rounded-2xl p-6 md:p-8">
              <div className="prose prose-gray max-w-none">
                <h2>1. Общие положения</h2>
                <p>
                  Настоящая Политика конфиденциальности определяет порядок обработки и защиты
                  персональных данных пользователей сайта techstore.ru (далее — «Сайт»).
                </p>

                <h2>2. Какие данные мы собираем</h2>
                <ul>
                  <li>ФИО</li>
                  <li>Номер телефона</li>
                  <li>Адрес электронной почты</li>
                  <li>Адрес доставки</li>
                </ul>

                <h2>3. Цели обработки данных</h2>
                <p>Персональные данные используются для:</p>
                <ul>
                  <li>Обработки заказов</li>
                  <li>Связи с клиентами</li>
                  <li>Улучшения качества обслуживания</li>
                </ul>

                <h2>4. Защита данных</h2>
                <p>
                  Мы принимаем все необходимые меры для защиты ваших персональных данных
                  от несанкционированного доступа, изменения, раскрытия или уничтожения.
                </p>

                <h2>5. Согласие</h2>
                <p>
                  Оставляя заявку на сайте, вы даете согласие на обработку ваших персональных данных
                  в соответствии с настоящей Политикой.
                </p>

                {page?.content && (
                  <div dangerouslySetInnerHTML={{ __html: page.content }} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
