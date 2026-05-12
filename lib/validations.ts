import { z } from 'zod'

// Phone validation with Russian format support
export const phoneSchema = z.string()
  .min(10, 'Номер телефона должен содержать минимум 10 цифр')
  .max(18, 'Номер телефона слишком длинный')
  .refine((val) => {
    const cleaned = val.replace(/\D/g, '')
    return cleaned.length === 11 && (cleaned[0] === '7' || cleaned[0] === '8') ||
           cleaned.length === 10
  }, 'Введите корректный номер телефона')

// Name validation
export const nameSchema = z.string()
  .min(2, 'Имя должно содержать минимум 2 символа')
  .max(100, 'Имя слишком длинное')
  .refine((val) => val.trim().length > 0, 'Имя не может быть пустым')

// Email validation
export const emailSchema = z.string()
  .email('Введите корректный email')
  .optional()
  .or(z.literal(''))

// Lead form schema
export const leadFormSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  comment: z.string().max(1000, 'Комментарий слишком длинный').optional(),
  agreement: z.literal(true, {
    errorMap: () => ({ message: 'Необходимо согласие на обработку персональных данных' })
  }),
})

// One-click buy form schema
export const oneClickBuySchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  agreement: z.literal(true, {
    errorMap: () => ({ message: 'Необходимо согласие на обработку персональных данных' })
  }),
})

// Trade-in form schema
export const tradeInFormSchema = z.object({
  brand: z.string().min(1, 'Выберите бренд'),
  model: z.string().min(1, 'Укажите модель'),
  condition: z.string().min(1, 'Укажите состояние'),
  memory: z.string().optional(),
  kit: z.string().optional(),
  name: nameSchema,
  phone: phoneSchema,
  comment: z.string().max(1000).optional(),
  agreement: z.literal(true, {
    errorMap: () => ({ message: 'Необходимо согласие на обработку персональных данных' })
  }),
})

// IMEI check form schema
export const imeiCheckSchema = z.object({
  imei: z.string()
    .min(14, 'IMEI должен содержать минимум 14 цифр')
    .max(17, 'IMEI слишком длинный')
    .refine((val) => /^\d+$/.test(val.replace(/\D/g, '')), 'IMEI должен содержать только цифры'),
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
})

// Contact form schema
export const contactFormSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  message: z.string().max(2000, 'Сообщение слишком длинное').optional(),
  agreement: z.literal(true, {
    errorMap: () => ({ message: 'Необходимо согласие на обработку персональных данных' })
  }),
})

// Review form schema
export const reviewFormSchema = z.object({
  authorName: nameSchema,
  rating: z.number().min(1, 'Поставьте оценку').max(5),
  title: z.string().max(200).optional(),
  text: z.string().min(10, 'Отзыв должен содержать минимум 10 символов').max(5000, 'Отзыв слишком длинный'),
})

// Product filter schema
export const productFilterSchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  memory: z.string().optional(),
  color: z.string().optional(),
  inStock: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isHit: z.boolean().optional(),
  sort: z.enum(['popular', 'price-asc', 'price-desc', 'newest', 'name']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
})

// Registration schema
export const registerSchema = z.object({
  name: nameSchema,
  email: z.string().email('Введите корректный email'),
  phone: phoneSchema.optional(),
  password: z.string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(/[A-Z]/, 'Пароль должен содержать заглавную букву')
    .regex(/[a-z]/, 'Пароль должен содержать строчную букву')
    .regex(/[0-9]/, 'Пароль должен содержать цифру'),
  confirmPassword: z.string(),
  agreement: z.literal(true, {
    errorMap: () => ({ message: 'Необходимо согласие на обработку персональных данных' })
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
})

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
})

// Promo code schema
export const promoCodeSchema = z.object({
  code: z.string().min(1, 'Введите промокод'),
})

// Type exports
export type LeadFormData = z.infer<typeof leadFormSchema>
export type OneClickBuyFormData = z.infer<typeof oneClickBuySchema>
export type TradeInFormData = z.infer<typeof tradeInFormSchema>
export type ImeiCheckFormData = z.infer<typeof imeiCheckSchema>
export type ContactFormData = z.infer<typeof contactFormSchema>
export type ReviewFormData = z.infer<typeof reviewFormSchema>
export type ProductFilterData = z.infer<typeof productFilterSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type PromoCodeFormData = z.infer<typeof promoCodeSchema>
