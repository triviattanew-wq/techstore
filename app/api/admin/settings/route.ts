import { NextRequest, NextResponse } from 'next/server'

// Настройки хранятся в .env, здесь возвращаем публичные значения
export async function GET() {
  return NextResponse.json({
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'TechStore',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    adminEmail: process.env.ADMIN_EMAIL || '',
    nodeEnv: process.env.NODE_ENV || 'development',
  })
}
