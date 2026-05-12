/**
 * Скрипт для обработки изображений iPhone
 * 
 * Функции:
 * - Изменение размера изображений
 * - Конвертация в WebP
 * - Оптимизация качества
 * - Создание структуры папок
 * 
 * Использование:
 * node scripts/process-images.js
 */

const sharp = require('sharp')
const fs = require('fs').promises
const path = require('path')

// Конфигурация
const CONFIG = {
  // Папка с исходными изображениями
  inputDir: './temp-images',
  
  // Папка для обработанных изображений
  outputDir: './public/images/products',
  
  // Размеры изображений
  sizes: {
    large: { width: 1200, height: 1200, suffix: '' },
    medium: { width: 800, height: 800, suffix: '-medium' },
    small: { width: 400, height: 400, suffix: '-small' },
    thumb: { width: 200, height: 200, suffix: '-thumb' },
  },
  
  // Качество WebP (0-100)
  quality: 85,
  
  // Формат вывода
  format: 'webp',
}

// Структура моделей и цветов
const MODELS = {
  'iphone-16': {
    name: 'iPhone 16',
    colors: ['ultramarine', 'teal', 'pink', 'white', 'black']
  },
  'iphone-16-plus': {
    name: 'iPhone 16 Plus',
    colors: ['ultramarine', 'teal', 'pink', 'white', 'black']
  },
  'iphone-16-pro': {
    name: 'iPhone 16 Pro',
    colors: ['desert-titanium', 'natural-titanium', 'white-titanium', 'black-titanium']
  },
  'iphone-16-pro-max': {
    name: 'iPhone 16 Pro Max',
    colors: ['desert-titanium', 'natural-titanium', 'white-titanium', 'black-titanium']
  },
  'iphone-17': {
    name: 'iPhone 17',
    colors: ['lavender', 'sage', 'mist-blue', 'white', 'black']
  },
  'iphone-17-pro': {
    name: 'iPhone 17 Pro',
    colors: ['cosmic-orange', 'deep-blue', 'silver']
  },
  'iphone-17-pro-max': {
    name: 'iPhone 17 Pro Max',
    colors: ['cosmic-orange', 'deep-blue', 'silver']
  },
  'iphone-17e': {
    name: 'iPhone 17e',
    colors: ['black', 'white', 'soft-pink']
  },
}

/**
 * Создает структуру папок для всех моделей
 */
async function createDirectoryStructure() {
  console.log('📁 Создание структуры папок...')
  
  for (const [modelSlug, modelData] of Object.entries(MODELS)) {
    const modelDir = path.join(CONFIG.outputDir, modelSlug)
    
    try {
      await fs.mkdir(modelDir, { recursive: true })
      console.log(`✓ Создана папка: ${modelDir}`)
    } catch (error) {
      console.error(`✗ Ошибка создания папки ${modelDir}:`, error.message)
    }
  }
  
  console.log('✅ Структура папок создана\n')
}

/**
 * Обрабатывает одно изображение
 */
async function processImage(inputPath, outputPath, size) {
  try {
    await sharp(inputPath)
      .resize(size.width, size.height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .webp({ quality: CONFIG.quality })
      .toFile(outputPath)
    
    return true
  } catch (error) {
    console.error(`✗ Ошибка обработки ${inputPath}:`, error.message)
    return false
  }
}

/**
 * Обрабатывает все изображения в папке
 */
async function processAllImages() {
  console.log('🖼️  Обработка изображений...\n')
  
  let processed = 0
  let skipped = 0
  let errors = 0
  
  for (const [modelSlug, modelData] of Object.entries(MODELS)) {
    console.log(`📱 Обработка ${modelData.name}...`)
    
    for (const color of modelData.colors) {
      // Ищем исходное изображение
      const possibleExtensions = ['jpg', 'jpeg', 'png', 'webp']
      let inputPath = null
      
      for (const ext of possibleExtensions) {
        const testPath = path.join(CONFIG.inputDir, modelSlug, `${color}.${ext}`)
        try {
          await fs.access(testPath)
          inputPath = testPath
          break
        } catch {
          // Файл не найден, пробуем следующее расширение
        }
      }
      
      if (!inputPath) {
        console.log(`  ⚠️  Пропущен ${color} - файл не найден`)
        skipped++
        continue
      }
      
      // Обрабатываем изображение в разных размерах
      let colorProcessed = true
      
      for (const [sizeName, sizeConfig] of Object.entries(CONFIG.sizes)) {
        const outputFilename = `${color}${sizeConfig.suffix}.${CONFIG.format}`
        const outputPath = path.join(CONFIG.outputDir, modelSlug, outputFilename)
        
        const success = await processImage(inputPath, outputPath, sizeConfig)
        
        if (!success) {
          colorProcessed = false
          errors++
        }
      }
      
      if (colorProcessed) {
        console.log(`  ✓ ${color}`)
        processed++
      }
    }
    
    console.log('')
  }
  
  console.log('📊 Статистика обработки:')
  console.log(`  ✓ Обработано: ${processed}`)
  console.log(`  ⚠️  Пропущено: ${skipped}`)
  console.log(`  ✗ Ошибок: ${errors}`)
}

/**
 * Генерирует отчет о недостающих изображениях
 */
async function generateMissingReport() {
  console.log('\n📋 Проверка недостающих изображений...\n')
  
  const missing = []
  
  for (const [modelSlug, modelData] of Object.entries(MODELS)) {
    for (const color of modelData.colors) {
      const possibleExtensions = ['jpg', 'jpeg', 'png', 'webp']
      let found = false
      
      for (const ext of possibleExtensions) {
        const testPath = path.join(CONFIG.inputDir, modelSlug, `${color}.${ext}`)
        try {
          await fs.access(testPath)
          found = true
          break
        } catch {
          // Файл не найден
        }
      }
      
      if (!found) {
        missing.push({
          model: modelData.name,
          modelSlug,
          color,
          expectedPath: path.join(CONFIG.inputDir, modelSlug, `${color}.[jpg|png|webp]`)
        })
      }
    }
  }
  
  if (missing.length === 0) {
    console.log('✅ Все изображения найдены!')
  } else {
    console.log(`⚠️  Недостает ${missing.length} изображений:\n`)
    
    for (const item of missing) {
      console.log(`  • ${item.model} - ${item.color}`)
      console.log(`    Ожидается: ${item.expectedPath}\n`)
    }
    
    // Сохраняем отчет в файл
    const reportPath = './missing-images-report.txt'
    const reportContent = missing.map(item => 
      `${item.model} - ${item.color}\nОжидается: ${item.expectedPath}\n`
    ).join('\n')
    
    await fs.writeFile(reportPath, reportContent)
    console.log(`📄 Отчет сохранен в: ${reportPath}`)
  }
}

/**
 * Создает структуру папок для загрузки исходных изображений
 */
async function createInputStructure() {
  console.log('📁 Создание структуры для исходных изображений...\n')
  
  for (const [modelSlug, modelData] of Object.entries(MODELS)) {
    const modelDir = path.join(CONFIG.inputDir, modelSlug)
    
    try {
      await fs.mkdir(modelDir, { recursive: true })
      console.log(`✓ ${modelData.name}`)
      console.log(`  Папка: ${modelDir}`)
      console.log(`  Цвета: ${modelData.colors.join(', ')}\n`)
    } catch (error) {
      console.error(`✗ Ошибка создания папки ${modelDir}:`, error.message)
    }
  }
  
  console.log('✅ Структура для исходных изображений создана')
  console.log(`\n💡 Поместите изображения в папку ${CONFIG.inputDir}`)
  console.log('   Формат имени файла: [цвет].jpg (например: ultramarine.jpg)')
}

/**
 * Главная функция
 */
async function main() {
  console.log('🚀 Скрипт обработки изображений iPhone\n')
  
  const args = process.argv.slice(2)
  const command = args[0] || 'process'
  
  try {
    switch (command) {
      case 'init':
        // Создать структуру папок для загрузки исходных изображений
        await createInputStructure()
        break
        
      case 'check':
        // Проверить недостающие изображения
        await generateMissingReport()
        break
        
      case 'process':
        // Обработать все изображения
        await createDirectoryStructure()
        await processAllImages()
        await generateMissingReport()
        break
        
      default:
        console.log('Доступные команды:')
        console.log('  init    - Создать структуру папок для исходных изображений')
        console.log('  check   - Проверить недостающие изображения')
        console.log('  process - Обработать все изображения (по умолчанию)')
        console.log('\nИспользование: node scripts/process-images.js [команда]')
    }
  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
    process.exit(1)
  }
}

// Запуск скрипта
main()
