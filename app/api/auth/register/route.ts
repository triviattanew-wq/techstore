import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const registerSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(100),
  email: z.string().email('Введите корректный email'),
  phone: z.string().min(10, 'Введите корректный номер телефона').optional(),
  password: z.string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Пароль должен содержать заглавную букву, строчную букву и цифру'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Проверяем, существует ли пользователь с таким email
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      )
    }

    // Проверяем телефон, если указан
    if (validatedData.phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone: validatedData.phone }
      })

      if (existingPhone) {
        return NextResponse.json(
          { error: 'Пользователь с таким номером телефона уже существует' },
          { status: 400 }
        )
      }
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        passwordHash: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Регистрация прошла успешно',
      user
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}