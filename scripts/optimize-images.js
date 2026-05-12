const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const INPUT_DIR = path.join('public', 'img')

// Настройки оптимизации по типу изображения
function getSettings(filename) {
  if (filename.includes('display') || filename.includes('banner')) 
    return { width: 1200, quality: 85 }
  if (['iPad', 'AirPods', 'AppleWatch', 'macbook', 'accesories'].some(n => filename.includes(n))) 
    return { width: 400, quality: 80 }
  return { width: 800, quality: 82 }
}

async function optimizeImage(filename) {
  const inputPath = path.join(INPUT_DIR, filename)
  const ext = path.extname(filename).toLowerCase()
  
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return null

  const settings = getSettings(filename)
  
  try {
    // Читаем файл через Buffer чтобы обойти проблему с кириллицей в пути
    const inputBuffer = fs.readFileSync(inputPath)
    const originalSize = inputBuffer.length
    
    const image = sharp(inputBuffer)
    const meta = await image.metadata()
    
    // Определяем выходное имя — всегда .webp
    const outputFilename = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '.webp')
    const outputPath = path.join(INPUT_DIR, outputFilename)

    let pipeline = image
    if (meta.width && meta.width > settings.width) {
      pipeline = pipeline.resize(settings.width, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
    }

    const outputBuffer = await pipeline
      .webp({ quality: settings.quality, effort: 4 })
      .toBuffer()

    fs.writeFileSync(outputPath, outputBuffer)
    
    // Удаляем оригинал если имя изменилось
    if (outputFilename !== filename) {
      fs.unlinkSync(inputPath)
    }
    
    const newSize = outputBuffer.length
    const saved = Math.round((1 - newSize / originalSize) * 100)
    
    return {
      original: filename,
      output: outputFilename,
      originalKB: Math.round(originalSize / 1024),
      newKB: Math.round(newSize / 1024),
      saved,
      renamed: outputFilename !== filename
    }
  } catch (err) {
    return { original: filename, error: err.message }
  }
}

async function main() {
  const files = fs.readdirSync(INPUT_DIR)
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
  
  console.log(`Найдено ${imageFiles.length} изображений\n`)
  
  let totalOriginal = 0
  let totalNew = 0
  const renames = []

  for (const file of imageFiles) {
    const result = await optimizeImage(file)
    if (!result) continue
    
    if (result.error) {
      console.log(`✗ ${result.original}: ${result.error}`)
      continue
    }

    totalOriginal += result.originalKB
    totalNew += result.newKB
    
    const arrow = result.saved > 0 ? `↓${result.saved}%` : `↑${Math.abs(result.saved)}%`
    console.log(`${result.saved > 0 ? '✓' : '~'} ${result.original} → ${result.newKB}KB (${arrow})`)
    
    if (result.renamed) {
      renames.push({ from: result.original, to: result.output })
    }
  }

  console.log(`\n═══════════════════════════════`)
  console.log(`Итого: ${totalOriginal}KB → ${totalNew}KB`)
  console.log(`Сэкономлено: ${totalOriginal - totalNew}KB (${Math.round((1 - totalNew/totalOriginal)*100)}%)`)
  
  if (renames.length > 0) {
    console.log(`\nПереименованные файлы:`)
    renames.forEach(r => console.log(`  ${r.from} → ${r.to}`))
  }
}

main().catch(console.error)
