# Скрипт для настройки базы данных PostgreSQL

Write-Host "Настройка базы данных для TechStore..." -ForegroundColor Green

# Проверяем Docker
Write-Host "Проверяем Docker..." -ForegroundColor Yellow
$dockerRunning = $false

try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "Docker найден: $dockerVersion" -ForegroundColor Green
        
        # Ждем пока Docker полностью загрузится
        Write-Host "Ожидание загрузки Docker (60 секунд)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 60
        
        # Пробуем подключиться к Docker
        try {
            docker ps 2>$null
            $dockerRunning = $true
            Write-Host "Docker работает!" -ForegroundColor Green
        }
        catch {
            Write-Host "Docker не отвечает" -ForegroundColor Red
        }
    }
}
catch {
    Write-Host "Docker не найден" -ForegroundColor Red
}

if ($dockerRunning) {
    Write-Host "Запускаем PostgreSQL через Docker..." -ForegroundColor Green
    
    # Останавливаем существующий контейнер если есть
    docker stop techstore-db 2>$null
    docker rm techstore-db 2>$null
    
    # Запускаем новый контейнер
    $result = docker run -d --name techstore-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=tech_store -p 5432:5432 postgres:15-alpine
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PostgreSQL запущен успешно!" -ForegroundColor Green
        Write-Host "Подключение: localhost:5432" -ForegroundColor Cyan
        Write-Host "База данных: tech_store" -ForegroundColor Cyan
        Write-Host "Пользователь: postgres" -ForegroundColor Cyan
        Write-Host "Пароль: postgres" -ForegroundColor Cyan
        
        # Ждем пока база данных запустится
        Write-Host "Ожидание запуска базы данных..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        # Применяем миграции
        Write-Host "Применяем миграции..." -ForegroundColor Yellow
        npx prisma db push
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Миграции применены успешно!" -ForegroundColor Green
        }
    }
    else {
        Write-Host "Ошибка запуска PostgreSQL через Docker" -ForegroundColor Red
        $dockerRunning = $false
    }
}

if (-not $dockerRunning) {
    Write-Host "Docker недоступен. Используем mock данные." -ForegroundColor Yellow
    Write-Host "Сайт будет работать с тестовыми данными без базы данных." -ForegroundColor Cyan
    
    # Проверяем что mock версия активна
    if (Test-Path "app\page-dev.tsx") {
        Copy-Item "app\page-dev.tsx" "app\page.tsx" -Force
        Write-Host "Активирована версия с mock данными" -ForegroundColor Green
    }
}

Write-Host "Настройка завершена!" -ForegroundColor Green
Write-Host "Запустите 'npm run dev' для запуска сервера разработки" -ForegroundColor Cyan