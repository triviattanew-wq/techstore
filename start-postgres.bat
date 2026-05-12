@echo off
echo Запуск PostgreSQL через Docker...

REM Ждем пока Docker полностью загрузится
timeout /t 30 /nobreak

REM Пробуем запустить контейнер
docker run -d --name techstore-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=tech_store -p 5432:5432 postgres:15-alpine

if %errorlevel% neq 0 (
    echo Ошибка запуска Docker контейнера
    echo Попробуйте запустить Docker Desktop вручную и подождать 2-3 минуты
    pause
    exit /b 1
)

echo PostgreSQL запущен успешно!
echo Подключение: localhost:5432
echo База данных: tech_store
echo Пользователь: postgres
echo Пароль: postgres

pause