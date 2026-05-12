#!/bin/bash

# Скрипт автоматической установки Tech Store на VPS
# Использование: bash spaceweb-deploy.sh

set -e

echo "🚀 Начинаем установку Tech Store на VPS..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Обновление системы
echo -e "${YELLOW}📦 Обновление системы...${NC}"
apt update && apt upgrade -y

# Установка Node.js 18
echo -e "${YELLOW}📦 Установка Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Установка PostgreSQL
echo -e "${YELLOW}🗄️  Установка PostgreSQL...${NC}"
apt install -y postgresql postgresql-contrib

# Установка Nginx
echo -e "${YELLOW}🌐 Установка Nginx...${NC}"
apt install -y nginx

# Установка PM2
echo -e "${YELLOW}⚙️  Установка PM2...${NC}"
npm install -g pm2

# Установка Git
echo -e "${YELLOW}📥 Установка Git...${NC}"
apt install -y git

# Создание пользователя для приложения
echo -e "${YELLOW}👤 Создание пользователя...${NC}"
if ! id -u techstore > /dev/null 2>&1; then
    useradd -m -s /bin/bash techstore
fi

# Настройка PostgreSQL
echo -e "${YELLOW}🗄️  Настройка PostgreSQL...${NC}"
sudo -u postgres psql -c "CREATE DATABASE tech_store;" || echo "База данных уже существует"
sudo -u postgres psql -c "CREATE USER tech_user WITH PASSWORD 'tech_password_2026';" || echo "Пользователь уже существует"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tech_store TO tech_user;"
sudo -u postgres psql -c "ALTER DATABASE tech_store OWNER TO tech_user;"

# Клонирование проекта
echo -e "${YELLOW}📥 Клонирование проекта...${NC}"
cd /var/www
if [ -d "techstore" ]; then
    echo "Директория уже существует, обновляем..."
    cd techstore
    git pull
else
    git clone https://github.com/triviattanew-wq/techstore.git
    cd techstore
fi

# Создание .env файла
echo -e "${YELLOW}⚙️  Создание .env файла...${NC}"
cat > .env << 'EOF'
DATABASE_URL="postgresql://tech_user:tech_password_2026@localhost:5432/tech_store"
DIRECT_URL="postgresql://tech_user:tech_password_2026@localhost:5432/tech_store"
NEXTAUTH_SECRET="SZs+RSVhIIcF8DbNF4P2z9S8lUfo3ZBZvPxhg5eEe8s="
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@techstore.ru"
ADMIN_PASSWORD="admin123"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="TechStore"
EOF

# Установка зависимостей
echo -e "${YELLOW}📦 Установка зависимостей...${NC}"
npm install

# Генерация Prisma клиента
echo -e "${YELLOW}🔧 Генерация Prisma клиента...${NC}"
npx prisma generate

# Применение миграций
echo -e "${YELLOW}🗄️  Применение миграций...${NC}"
npx prisma migrate deploy

# Заполнение базы данных
echo -e "${YELLOW}📊 Заполнение базы данных...${NC}"
npm run db:seed

# Сборка проекта
echo -e "${YELLOW}🏗️  Сборка проекта...${NC}"
npm run build

# Настройка прав
chown -R techstore:techstore /var/www/techstore

# Запуск с PM2
echo -e "${YELLOW}🚀 Запуск приложения...${NC}"
pm2 delete techstore 2>/dev/null || true
pm2 start npm --name "techstore" -- start
pm2 save
pm2 startup

# Настройка Nginx
echo -e "${YELLOW}🌐 Настройка Nginx...${NC}"
cat > /etc/nginx/sites-available/techstore << 'EOF'
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
EOF

ln -sf /etc/nginx/sites-available/techstore /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo -e "${GREEN}✅ Установка завершена!${NC}"
echo ""
echo "🎉 Ваш сайт доступен по адресу: http://ваш-ip-адрес"
echo ""
echo "📝 Данные для входа в админку:"
echo "   Email: admin@techstore.ru"
echo "   Пароль: admin123"
echo ""
echo "⚠️  ВАЖНО: Смените пароль администратора после первого входа!"
echo ""
echo "📊 Полезные команды:"
echo "   pm2 status          - статус приложения"
echo "   pm2 logs techstore  - логи приложения"
echo "   pm2 restart techstore - перезапуск"
echo ""
