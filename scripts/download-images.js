/**
 * Скрипт для автоматического скачивания изображений iPhone
 * 
 * Использование:
 * node scripts/download-images.js
 */

const https = require('https')
const http = require('http')
const fs = require('fs').promises
const path = require('path')
const { createWriteStream } = require('fs')

// Конфигурация
const CONFIG = {
  outputDir: './temp-images',
  timeout: 30000, // 30 секунд
}

// URL изображений (примерные - нужно будет обновить на реальные)
const IMAGE_URLS = {
  'iphone-16': {
    'ultramarine': 'https://www.apple.com/newsroom/images/2024/09/apple-introduces-iphone-16-and-iphone-16-plus/article/Apple-iPhone-16-finish-lineup-240909_big.jpg.large.jpg',
    'teal': '',
    'pink': '',
    'white': '',
    'black': '',
  },
  'iphone-16-plus': {
    'ultramarine': '',
    'teal': '',
    'pink': '',
    'white': '',
    'black': '',
  },
  'iphone-16-pro': {
    'desert-titanium': 'https://www.apple.com/newsroom/images/2024/09/apple-debuts-iphone-16-pro-and-iphone-16-pro-max/article/Apple-iPhone-16-Pro-finish-lineup-240909_big.jpg.large.jpg',
    'natural-titanium': '',
    'white-titanium': '',
    'black-titanium': '',
  },
  'iphone-16-pro-max': {
    'desert-titanium': '',
    'natural-titanium': '',
    'white-titanium': '',
    'black-titanium': '',
  },
  'iphone-17': {
    'lavender': '',
    'sage': '',
    'mist-blue': '',
    'white': '',
    'black': '',
  },
  'iphone-17-pro': {
    'cosmic-orange': '',
    'deep-blue': '',
    'silver': '',
  },
  'iphone-17-pro-max': {
    'cosmic-orange': '',
    'deep-blue': '',
    'silver': '',
  },
  'iphone-17e': {
    'black': 'https://www.apple.com/newsroom/images/2026/03/apple-introduces-iphone-17e/article/Apple-iPhone-17e-finish-lineup-260304_big.jpg.large.jpg',
    'white': '',
    'soft-pink': '',
  },
}

/**
 * Скачивает файл по URL
 */
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    
    const file = createWriteStream(outputPath)
    
    const request = protocol.get(url, { timeout: CONFIG.timeout }, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Редирект
        file.close()
        downloadFile(response.headers.location, outputPath)
          .then(resolve)
          .catch(reject)
        return
      }
      
      if (response.statusCode !== 200) {
        file.close()
        reject(new Error(`HTTP ${response.statusCode}: ${url}`))
        return
      }
      
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        resolve()
      })
    })
    
    request.on('error', (err) => {
      file.close()
      reject(err)
    })
    
    request.on('timeout', () => {
      request.destroy()
      file.close()
      reject(new Error('Timeout'))
    })
  })
}

/**
 * Создает структуру папок
 */
async function createDirectories() {
  console.log('📁 Создание структуры папок...\n')
  
  for (const model of Object.keys(IMAGE_URLS)) {
    const dir = path.join(CONFIG.outputDir, model)
    await fs.mkdir(dir, { recursive: true })
  }
  
  console.log('✅ Папки созданы\n')
}

/**
 * Скачивает все изображения
 */
async function downloadAllImages() {
  console.log('📥 Начинаем скачивание изображений...\n')
  
  let downloaded = 0
  let skipped = 0
  let errors = 0
  
  for (const [model, colors] of Object.entries(IMAGE_URLS)) {
    console.log(`📱 ${model}:`)
    
    for (const [color, url] of Object.entries(colors)) {
      if (!url || url.trim() === '') {
        console.log(`  ⚠️  ${color} - URL не указан`)
        skipped++
        continue
      }
      
      const ext = path.extname(new URL(url).pathname) || '.jpg'
      const outputPath = path.join(CONFIG.outputDir, model, `${color}${ext}`)
      
      try {
        // Проверяем, существует ли файл
        try {
          await fs.access(outputPath)
          console.log(`  ⏭️  ${color} - уже существует`)
          skipped++
          continue
        } catch {
          // Файл не существует, скачиваем
        }
        
        await downloadFile(url, outputPath)
        console.log(`  ✓ ${color}`)
        downloaded++
      } catch (error) {
        console.log(`  ✗ ${color} - ${error.message}`)
        errors++
      }
    }
    
    console.log('')
  }
  
  console.log('📊 Статистика:')
  console.log(`  ✓ Скачано: ${downloaded}`)
  console.log(`  ⏭️  Пропущено: ${skipped}`)
  console.log(`  ✗ Ошибок: ${errors}`)
}

/**
 * Главная функция
 */
async function main() {
  console.log('🚀 Автоматическое скачивание изображений iPhone\n')
  
  try {
    await createDirectories()
    await downloadAllImages()
    
    console.log('\n✅ Готово!')
    console.log('\n💡 Следующий шаг:')
    console.log('   node scripts/process-images.js process')
  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
    process.exit(1)
  }
}

// Запуск
main()
