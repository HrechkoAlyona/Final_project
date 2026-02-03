# Ichgram — Social Media Full-Stack Project

Полноценное Full-Stack приложение социальной сети, разработанное с использованием стека MERN (MongoDB, Express, React, Node.js) и Socket.io для функций реального времени.

##  Технологический стек

### Frontend:
* **Core:** React (Vite), JavaScript (ES6+).
* **State Management:** Redux Toolkit & RTK Query.
* **Routing:** React Router DOM v6.
* **Styling:** SCSS Modules, Flexbox, Adaptive Design.
* **Forms:** React Hook Form.
* **UI:** React Hot Toast, React Icons.

### Backend:
* **Core:** Node.js, Express.
* **Database:** MongoDB (Mongoose ODM).
* **Auth:** JWT (Access/Refresh), Bcrypt.
* **Real-time:** Socket.io (чаты, уведомления).
* **Media:** Обработка и хранение изображений.

---

## Реализованный функционал

### Авторизация (Auth)
* **Регистрация:** Валидация, проверка уникальности.
* **Вход:** Email/Password.
* **Восстановление пароля:** Email -> Код -> Новый пароль.

### Интерфейс (Frontend)
* **Адаптив:** Mobile First подход, корректный скроллинг (100dvh).
* **Layout:** Публичные страницы и приватная лента.

### Данные (Backend)
* **Posts:** CRUD (Создание, Чтение, Обновление, Удаление).
* **Feed:** Лента подписок и Рекомендации.
* **Users:** Поиск по имени и никнейму.
* **Interactions:** Лайки, Комментарии, Подписки.

---

## Как запустить

### 1. Установка

npm install
Настроить `.env` (PORT, MONGO_URI, JWT_SECRET)
`npm run dev`