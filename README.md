# Final Project - Social Media Backend

Full-stack приложение с использованием Node.js, Express, MongoDB и Socket.io.

## Реализованный функционал (Backend):
* **Auth**: Регистрация и логин с использованием JWT и хешированием паролей (Bcrypt).
* **Posts**: Полноценный CRUD (создание, чтение, обновление, удаление).
* **Smart Feed**: Разделение ленты на "Подписки" (Home) и "Рекомендации" (Explore).
* **Interactions**: Лайки, комментарии, система подписок на пользователей.
* **Real-time**: Уведомления и сообщения через Socket.io с использованием комнат (Rooms).
* **Search**: Поиск пользователей по username/fullName.

## Как запустить:
1. `npm install`
2. Настроить `.env` (PORT, MONGO_URI, JWT_SECRET)
3. `npm run dev`