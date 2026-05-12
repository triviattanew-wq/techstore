# 🌐 Деплой на Spaceweb VPS

## 📋 Что нужно:

1. **VPS на Spaceweb** (от 300₽/мес)
2. **SSH доступ** к серверу
3. **30 минут** времени

---

## 🚀 Быстрая установка (автоматически)

### Шаг 1: Закажите VPS

1. Зайдите на https://sweb.ru
2. Выберите **VPS Linux**
3. Выберите тариф (минимум 1GB RAM)
4. Операционная система: **Ubuntu 20.04** или **22.04**
5. Оформите заказ

### Шаг 2: Получите данные доступа

После активации вы получите:
- **IP адрес:** например `123.45.67.89`
- **Логин:** обычно `root`
- **Пароль:** в письме от Spaceweb

### Шаг 3: Подключитесь к серверу

Откройте PowerShell и выполните:

```bash
ssh root@ваш-ip-адрес
```

Введите пароль (при вводе символы не отображаются - это нормально).

### Шаг 4: Запустите автоматическую установку

Скопируйте и выполните эту команду:

```bash
curl -o- https://raw.githubusercontent.com/triviattanew-wq/techstore/main/spaceweb-deploy.sh | bash
```

Или вручную:

```bash
# Скачать скрипт
wget https://raw.githubusercontent.com/triviattanew-wq/techstore/main/spaceweb-deploy.sh

# Сделать исполняемым
chmod +x spaceweb-deploy.sh

# Запустить
./spaceweb-deploy.sh
```

### Шаг 5: Дождитесь завершения

Скрипт автоматически:
- ✅ Установит Node.js, PostgreSQL, Nginx, PM2
- ✅ Создаст базу данных
- ✅ Клонирует проект из GitHub
- ✅ Установит зависимости
- ✅ Применит миграции
- ✅ Заполнит базу данными
- ✅ Соберет проект
- ✅ Запустит приложение
- ✅ Настроит Nginx

Это займет **5-10 минут**.

### Шаг 6: Готово!

После завершения ваш сайт будет доступен по адресу:
```
http://ваш-ip-адрес
```

**Админ панель:**
```
http://ваш-ip-адрес/admin/login
```

**Данные для входа:**
- Email: `admin@techstore.ru`
- Пароль: `admin123`

⚠️ **ВАЖНО:** Смените пароль после первого входа!

---

## 🔧 Ручная установка (если автоматическая не сработала)

### 1. Обновление системы

```bash
apt update && apt upgrade -y
```

### 2. Установка Node.js 18

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
```

### 3. Установка PostgreSQL

```bash
apt install -y postgresql postgresql-contrib
```

### 4. Создание базы данных

```bash
sudo -u postgres psql
```

В PostgreSQL выполните:

```sql
CREATE DATABASE tech_store;
CREATE USER tech_user WITH PASSWORD 'tech_password_2026';
GRANT ALL PRIVILEGES ON DATABASE tech_store TO tech_user;
ALTER DATABASE tech_store OWNER TO tech_user;
\q
```

### 5. Установка Nginx

```bash
apt install -y nginx
```

### 6. Установка PM2

```bash
npm install -g pm2
```

### 7. Клонирование проекта

```bash
cd /var/www
git clone https://github.com/triviattanew-wq/techstore.git
cd techstore
```

### 8. Создание .env файла

```bash
nano .env
```

Вставьте:

```env
DATABASE_URL="postgresql://tech_user:tech_password_2026@localhost:5432/tech_store"
DIRECT_URL="postgresql://tech_user:tech_password_2026@localhost:5432/tech_store"
NEXTAUTH_SECRET="SZs+RSVhIIcF8DbNF4P2z9S8lUfo3ZBZvPxhg5eEe8s="
NEXTAUTH_URL="http://ваш-ip-адрес"
ADMIN_EMAIL="admin@techstore.ru"
ADMIN_PASSWORD="admin123"
NEXT_PUBLIC_SITE_URL="http://ваш-ip-адрес"
NEXT_PUBLIC_SITE_NAME="TechStore"
```

Сохраните: `Ctrl+X`, `Y`, `Enter`

### 9. Установка зависимостей

```bash
npm install
```

### 10. Настройка Prisma

```bash
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```

### 11. Сборка проекта

```bash
npm run build
```

### 12. Запуск с PM2

```bash
pm2 start npm --name "techstore" -- start
pm2 save
pm2 startup
```

Выполните команду, которую покажет PM2.

### 13. Настройка Nginx

```bash
nano /etc/nginx/sites-available/techstore
```

Вставьте:

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Сохраните и активируйте:

```bash
ln -s /etc/nginx/sites-available/techstore /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

---

## 🎉 Готово!

Ваш сайт доступен по адресу: `http://ваш-ip-адрес`

---

## 📊 Полезные команды

### PM2 (управление приложением)

```bash
pm2 status              # Статус
pm2 logs techstore      # Логи
pm2 restart techstore   # Перезапуск
pm2 stop techstore      # Остановка
pm2 delete techstore    # Удаление
```

### Nginx (веб-сервер)

```bash
systemctl status nginx   # Статус
systemctl restart nginx  # Перезапуск
nginx -t                 # Проверка конфигурации
```

### PostgreSQL (база данных)

```bash
sudo -u postgres psql tech_store  # Подключение к БД
```

### Обновление сайта

```bash
cd /var/www/techstore
git pull
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart techstore
```

---

## 🔐 Настройка домена (опционально)

### 1. Купите домен

На любом регистраторе (Reg.ru, Timeweb, и т.д.)

### 2. Настройте DNS

Добавьте A-запись:
- **Тип:** A
- **Имя:** @
- **Значение:** ваш-ip-адрес

### 3. Обновите Nginx

```bash
nano /etc/nginx/sites-available/techstore
```

Измените `server_name _` на `server_name ваш-домен.ru www.ваш-домен.ru`

### 4. Установите SSL (Let's Encrypt)

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
```

### 5. Обновите .env

```bash
nano /var/www/techstore/.env
```

Измените:
- `NEXTAUTH_URL="https://ваш-домен.ru"`
- `NEXT_PUBLIC_SITE_URL="https://ваш-домен.ru"`

Перезапустите:

```bash
pm2 restart techstore
```

---

## 🆘 Решение проблем

### Сайт не открывается

```bash
# Проверьте статус приложения
pm2 status

# Проверьте логи
pm2 logs techstore

# Проверьте Nginx
systemctl status nginx
```

### Ошибка базы данных

```bash
# Проверьте PostgreSQL
systemctl status postgresql

# Проверьте подключение
sudo -u postgres psql -c "\l"
```

### Порт 3000 занят

```bash
# Найдите процесс
lsof -i :3000

# Убейте процесс
kill -9 <PID>

# Перезапустите
pm2 restart techstore
```

---

## 💰 Стоимость

**Spaceweb VPS:**
- Минимальный тариф: от 300₽/мес
- Рекомендуемый: от 500₽/мес (2GB RAM)

**Домен:**
- .ru: от 200₽/год
- .com: от 600₽/год

**SSL сертификат:**
- Let's Encrypt: бесплатно

**Итого:** от 300₽/мес + домен

---

## 📞 Поддержка Spaceweb

- **Сайт:** https://sweb.ru
- **Телефон:** 8 (800) 333-58-78
- **Email:** support@sweb.ru

---

Удачного деплоя! 🚀
