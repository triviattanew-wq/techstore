import { ShieldCheck, Truck, Award, HeadphonesIcon } from 'lucide-react'

const features = [
  {
    icon: ShieldCheck,
    title: 'Гарантия качества',
    description: 'Вся техника сертифицирована и имеет официальную гарантию производителя',
  },
  {
    icon: Truck,
    title: 'Быстрая доставка',
    description: 'Доставка по Москве за 1-2 дня, по России — от 3 дней',
  },
  {
    icon: Award,
    title: 'Оригинальная техника',
    description: 'Только подлинные товары от официальных поставщиков',
  },
  {
    icon: HeadphonesIcon,
    title: 'Консультация специалистов',
    description: 'Поможем подобрать технику под ваши задачи и бюджет',
  },
]

export function Features() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {features.map((feature, index) => (
        <div 
          key={index} 
          className="flex flex-col items-center text-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center mb-4">
            <feature.icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">{feature.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
        </div>
      ))}
    </div>
  )
}
