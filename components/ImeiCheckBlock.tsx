import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'

export function ImeiCheckBlock() {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 md:p-10">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-primary-100 rounded-2xl flex items-center justify-center">
            <Search className="w-8 h-8 md:w-10 md:h-10 text-primary-600" />
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-bold mb-2">
            Проверка IMEI или серийного номера
          </h2>
          <p className="text-gray-600 mb-4 md:mb-6">
            Узнайте оригинальность устройства Apple, дату покупки, остаток гарантии и другую информацию по IMEI или серийному номеру.
          </p>
          <Link
            href="/imei-check"
            className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700"
          >
            Проверить устройство
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
