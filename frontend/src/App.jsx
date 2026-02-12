// frontend\src\App.jsx

import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// API и Сервисы
import { getSocket } from "./services/api";

// Страницы
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Reset from "./pages/Auth/Reset";
import Home from "./pages/Home/Home";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import EditProfile from "./pages/EditProfile/EditProfile";
import PostPage from "./pages/PostPage/PostPage";
import Explore from "./pages/Explore/Explore";
import NotFound from "./pages/NotFound/NotFound";
import MessagesPage from "./pages/Messages/MessagesPage";

// Компоненты
import Layout from "./components/Layout/Layout";

// Контекст и Хуки
import { NavigationProvider } from "./context/NavigationProvider";
import { useAuth } from "./hooks/useAuth";
import { useChatSocket } from "./hooks/useChatSocket";

function App() {
  const { userId, isLoading } = useAuth();
  const location = useLocation();

  // Логика для модальных окон (если вы планируете открывать посты поверх ленты)
  const background = location.state?.backgroundLocation;

  // Хук для прослушивания чатов (входящие сообщения)
  useChatSocket();

  // --- ЛОГИКА СОКЕТОВ (JOIN ROOM) ---
  useEffect(() => {
    // Если пользователя нет, ничего не делаем
    if (!userId) return;

    const socket = getSocket();

    // Функция входа в комнату
    const handleJoin = () => {
      console.log("📡 Emitting join for user:", userId);
      socket.emit("join", userId);
    };

    // 1. Если сокет уже подключен — входим сразу
    if (socket.connected) {
      handleJoin();
    }

    // 2. Слушаем событие переподключения (если интернет моргнул)
    socket.on("connect", handleJoin);

    // 3. CLEANUP: Обязательно удаляем слушатель при размонтировании
    return () => {
      socket.off("connect", handleJoin);
    };
  }, [userId]);

  if (isLoading) return null; // Или красивый спиннер

  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <NavigationProvider>
      <Toaster position="top-center" reverseOrder={false} />

      {/* background || location — это хитрость Router v6.
          Если есть background, роутер думает, что мы всё еще на старой странице (Home),
          но URL в браузере сменится. Это нужно для модалок.
      */}
      <Routes location={background || location}>
        {/* --- ПУБЛИЧНЫЕ --- */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <Register /> : <Navigate to="/" />}
        />
        <Route path="/reset" element={<Reset />} />
        <Route path="/reset-password/:username" element={<Reset />} />

        {/* --- ПРИВАТНЫЕ (С ЛЕЙАУТОМ) --- */}
        {isAuthenticated ? (
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/explore" element={<Explore />} />

            {/* Страница поста (откроется как отдельная страница, если обновить) */}
            <Route path="/post/:id" element={<PostPage />} />

            <Route path="/messages" element={<MessagesPage />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </NavigationProvider>
  );
}

export default App;
