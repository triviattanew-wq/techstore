# 🚀 Деплой на Vercel - Пошаговая инструкция

## ✅ Код загружен на GitHub!

**Репозиторий:** https://github.com/triviattanew-wq/techstore

---

## 📋 Шаг 1: Создайте новый проект на Vercel

1. **Откройте:** https://vercel.com/new
2. **Выберите:** "Import Git Repository"
3. **Найдите репозиторий:** `triviattanew-wq/techstore`
4. **Нажмите:** "Import"

---

## 📋 Шаг 2: Настройте проект

### Framework Preset:
Vercel автоматически определит **Next.js** ✅

### Root Directory:
Оставьте по умолчанию (`.`)

### Build Command:
```bash
prisma generate && next build
```

### Install Command:
```bash
npm install
```

---

## 📋 Шаг 3: Добавьте переменные окружения

Нажмите **"Environment Variables"** и добавьте:

### 1. DATABASE_URL
```
postgresql://neondb_owner:npg_cap75jlybEnY@ep-damp-wind-al26jk2t.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

### 2. DIRECT_URL
```
postgresql://neondb_owner:npg_cap75jlybEnY@ep-damp-wind-al26jk2t.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

### 3. NEXTAUTH_SECRET
```
SZs+RSVhIIcF8DbNF4P2z9S8lUfo3ZBZvPxhg5eEe8s=
```

### 4. NEXTAUTH_URL
```
https://ваш-проект.vercel.app
```
⚠️ **Замените после первого деплоя на реальный URL!**

### 5. ADMIN_EMAIL
```
admin@techstore.ru
```

### 6. ADMIN_PASSWORD
```
admin123
```
⚠️ **Смените после первого входа!**

### 7. NEXT_PUBLIC_SITE_URL
```
https://ваш-проект.vercel.app
```
⚠️ **Замените после первого деплоя на реальный URL!**

### 8. NEXT_PUBLIC_SITE_NAME
```
TechStore
```

---

## 📋 Шаг 4: Деплой

1. **Нажмите:** "Deploy"
2. **Дождитесь:** завершения сборки (2-3 минуты)
3. **Vercel покажет:** URL вашего сайта

---

## 📋 Шаг 5: Обновите URL в переменных

После успешного деплоя:

1. **Скопируйте URL** вашего проекта (например: `https://techstore-abc123.vercel.app`)
2. **Зайдите в:** Settings → Environment Variables
3. **Обновите:**
   - `NEXTAUTH_URL` → ваш реальный URL
   - `NEXT_PUBLIC_SITE_URL` → ваш реальный URL
4. **Зайдите в:** Deployments
5. **Нажмите:** три точки на последнем деплое → "Redeploy"

---

## 📋 Шаг 6: Проверка

Откройте ваш сайт и проверьте:

### ✅ Главная страница
```
https://ваш-проект.vercel.app
```

### ✅ API
```
https://ваш-проект.vercel.app/api/products
```
Должен вернуть JSON с товарами

### ✅ Админ панель
```
https://ваш-проект.vercel.app/admin/login
```
- **Email:** admin@techstore.ru
- **Пароль:** admin123

---

## 🎨 Опционально: Добавьте свой домен

1. **В Vercel Dashboard:** Settings → Domains
2. **Нажмите:** "Add Domain"
3. **Введите:** ваш домен (например: `techstore.ru`)
4. **Следуйте инструкциям** Vercel для настройки DNS
5. **После подключения обновите:**
   - `NEXTAUTH_URL` → `https://techstore.ru`
   - `NEXT_PUBLIC_SITE_URL` → `https://techstore.ru`
6. **Redeploy** проект

---

## 🔄 Автоматическое обновление

После деплоя любые изменения автоматически деплоятся:

```bash
# Внесите изменения в код
git add .
git commit -m "Описание изменений"
git push
```

Vercel автоматически:
1. Обнаружит изменения в GitHub
2. Соберет проект
3. Задеплоит новую версию

---

## 🆘 Решение проблем

### Ошибка "Build failed"

**Проверьте логи:**
1. В Vercel Dashboard → Deployments
2. Нажмите на failed deployment
3. Откройте "Build Logs"

**Частые причины:**
- Не добавлены переменные окружения
- Неправильный `DATABASE_URL`
- Ошибка в коде

**Решение:**
1. Проверьте все переменные окружения
2. Убедитесь, что `DATABASE_URL` правильный
3. Проверьте логи на наличие конкретной ошибки

### Ошибка "Database connection failed"

**Проверьте:**
1. `DATABASE_URL` правильный
2. В URL есть `?sslmode=require`
3. База данных Neon активна

**Решение:**
1. Зайдите в Neon Console: https://console.neon.tech
2. Проверьте статус базы данных
3. Скопируйте Connection String заново
4. Обновите `DATABASE_URL` в Vercel

### Ошибка "Module not found: @prisma/client"

**Решение:**
1. Проверьте Build Command в Vercel:
   ```
   prisma generate && next build
   ```
2. Или добавьте в `package.json`:
   ```json
   "scripts": {
     "postinstall": "prisma generate"
   }
   ```
3. Redeploy проект

### Не работает админ панель (ошибка авторизации)

**Проверьте:**
1. `NEXTAUTH_URL` совпадает с реальным URL сайта
2. `NEXTAUTH_SECRET` добавлен

**Решение:**
1. Обновите `NEXTAUTH_URL` на правильный URL
2. Очистите cookies браузера
3. Попробуйте войти снова

---

## 📊 Мониторинг

В Vercel Dashboard вы можете:

- **Deployments:** История всех деплоев
- **Analytics:** Статистика посещений
- **Logs:** Логи функций и ошибок
- **Speed Insights:** Производительность сайта

---

## 🔐 Безопасность

**После деплоя обязательно:**

1. **Смените пароль администратора:**
   - Войдите в админку
   - Перейдите в настройки пользователя
   - Смените пароль с `admin123`

2. **Обновите переменную окружения:**
   - В Vercel Settings → Environment Variables
   - Обновите `ADMIN_PASSWORD`
   - Redeploy проект

3. **Настройте SMTP** (опционально):
   - Добавьте переменные SMTP в Vercel
   - Настройте email уведомления

---

## 📞 Полезные ссылки

- **Ваш репозиторий:** https://github.com/triviattanew-wq/techstore
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Neon Console:** https://console.neon.tech
- **Документация Vercel:** https://vercel.com/docs

---

## 🎉 Готово!

После выполнения всех шагов ваш сайт будет доступен по адресу:
```
https://ваш-проект.vercel.app
```

**Админ панель:**
```
https://ваш-проект.vercel.app/admin/login
```

Удачи! 🚀
