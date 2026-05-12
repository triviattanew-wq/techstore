import Link from 'next/link'
import { CheckCircle, Phone, ArrowRight } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function CartSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="container-custom max-w-lg">
          <div className="bg-white rounded-2xl p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold mb-3">Заявка отправлена!</h1>
            <p className="text-gray-600 mb-6">
              Спасибо за ваш заказ! Наш менеджер свяжется с вами в ближайшее время для подтверждения.
            </p>

            <div className="flex items-center justify-center gap-2 text-gray-500 mb-8">
              <Phone className="w-4 h-4" />
              <span>Ожидайте звонка</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/catalog" className="btn-primary flex-1">
                Продолжить покупки
              </Link>
              <Link href="/" className="btn-secondary flex-1">
                На главную
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
