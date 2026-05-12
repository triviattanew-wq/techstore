import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import ContactForm from '@/components/ContactForm'

export const metadata = {
  title: 'Контакты',
  description: 'Свяжитесь с нами по телефону, email или оставьте заявку на сайте.',
}

export default async function ContactsPage() {
  const page = await prisma.page.findUnique({
    where: { slug: 'contacts' },
  })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="container-custom py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Контакты</h1>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="bg-white rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-6">Наши контакты</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Телефон</h3>
                    <a href="tel:+78001234567" className="text-lg font-medium hover:text-primary-600">
                      8 (800) 123-45-67
                    </a>
                    <p className="text-sm text-gray-500">Бесплатно по России</p>
                  </div>

                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Email</h3>
                    <a href="mailto:info@techstore.ru" className="text-lg font-medium hover:text-primary-600">
                      info@techstore.ru
                    </a>
                  </div>

                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Адрес</h3>
                    <p className="text-lg font-medium">Москва, ул. Примерная, 1</p>
                    <p className="text-sm text-gray-500">ТЦ «Пример», 2 этаж</p>
                  </div>

                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Режим работы</h3>
                    <p className="text-lg font-medium">Пн-Вс: 10:00 — 21:00</p>
                    <p className="text-sm text-gray-500">Без выходных</p>
                  </div>
                </div>

                {/* Map placeholder */}
                <div className="mt-6 h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                  Карта загружается...
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-6">Напишите нам</h2>
                <ContactForm />
              </div>
            </div>

            {/* Additional content from CMS */}
            {page?.content && (
              <div className="mt-12 bg-white rounded-2xl p-6 md:p-8">
                <div dangerouslySetInnerHTML={{ __html: page.content }} />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
