# Web-ларёк: Бэкенд

REST API для интернет-магазина «Web-ларёк». Сервер на Express + TypeScript с MongoDB: управление товарами, оформление заказов, JWT-авторизация с refresh-токенами, загрузка изображений, валидация данных через celebrate/joi, централизованная обработка ошибок и логирование.

## Технологии

- Node.js, Express, TypeScript
- MongoDB, Mongoose (схемы, валидация, триггеры)
- JWT-авторизация (access + refresh токены, httpOnly cookies)
- celebrate + joi (валидация запросов)
- multer (загрузка файлов)
- bcrypt (хеширование паролей)
- express-winston (логирование запросов и ошибок)
- CORS
- ESLint (Airbnb стайлгайд)

## Запуск

```bash
# Установка зависимостей
npm install

# Разработка с хот-релоадом
npm run dev

# Сборка
npm run build

# Запуск
npm run start
