// frontend\src\App.jsx

import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// API
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

  const background = location.state?.backgroundLocation;

  useChatSocket();

  // --- ЛОГИКА СОКЕТОВ (JOIN ROOM) ---
  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();

    const handleJoin = () => {
      socket.emit("join", userId);
    };

    if (socket.connected) {
      handleJoin();
    }

    socket.on("connect", handleJoin);

    return () => {
      socket.off("connect", handleJoin);
    };
  }, [userId]);

  if (isLoading) return null; // Или <LoadingSpinner />

  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <NavigationProvider>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes location={background || location}>
        {/* --- ПУБЛИЧНЫЕ МАРШРУТЫ --- */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <Register /> : <Navigate to="/" />}
        />
        <Route path="/reset" element={<Reset />} />
        <Route path="/reset-password/:token" element={<Reset />} />

        {/* --- ПРИВАТНЫЕ МАРШРУТЫ (ВНУТРИ LAYOUT) --- */}
        {isAuthenticated ? (
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/post/:id" element={<PostPage />} />
            
            {/* 404 внутри приложения */}
            <Route path="*" element={<NotFound />} />
          </Route>
        ) : (
          // Если не авторизован -> на логин
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </NavigationProvider>
  );
}

export default App;