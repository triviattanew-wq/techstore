import Link from 'next/link'
import { ArrowRight, RefreshCcw } from 'lucide-react'

export function TradeInBlock() {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 p-6 md:p-10">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm mb-4">
            <RefreshCcw className="w-4 h-4" />
            Trade-in
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Обменяйте старый смартфон на новый
          </h2>
          <p className="text-gray-300 mb-6 max-w-md">
            Получите скидку до 50 000 ₽ при обмене вашего старого устройства на новый iPhone или смартфон Samsung.
          </p>
          <Link
            href="/trade-in"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-medium rounded-full hover:bg-gray-100 transition-colors"
          >
            Оценить устройство
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="relative w-full md:w-80 h-48 md:h-56">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Old phone */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-20 h-40 bg-gray-700 rounded-xl opacity-80" />
              {/* Arrow */}
              <ArrowRight className="absolute left-16 top-1/2 -translate-y-1/2 w-6 h-6 text-primary-400" />
              {/* New phone */}
              <div className="absolute left-24 top-1/2 -translate-y-1/2 w-24 h-48 bg-gradient-to-b from-gray-600 to-gray-700 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
