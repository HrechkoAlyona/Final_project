// frontend\src\App.jsx
import React, { useEffect } from 'react'; // Добавь useEffect
import { getSocket } from './services/api'; // Импортируй getSocket
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Страницы
import Login from './pages/Auth/Login'; 
import Register from './pages/Auth/Register'; 
import Reset from './pages/Auth/Reset';
import Home from './pages/Home/Home';
import ProfilePage from './pages/ProfilePage/ProfilePage'; 
import EditProfile from './pages/EditProfile/EditProfile';
import PostPage from './pages/PostPage/PostPage'; // ✅ Импорт есть
import Explore from './pages/Explore/Explore'; 
import NotFound from './pages/NotFound/NotFound';
import MessagesPage from './pages/Messages/MessagesPage'; 

// Компоненты
import Layout from './components/Layout/Layout';

// Контекст и Хуки
import { NavigationProvider } from './context/NavigationProvider';
import { useAuth } from './hooks/useAuth';
import { useChatSocket } from './hooks/useChatSocket'; 

function App() {
  const { userId, isLoading } = useAuth(); // Достань userId из хука
  const location = useLocation();
  const background = location.state?.backgroundLocation;

  useChatSocket();

  useEffect(() => {
    if (userId) {
      const socket = getSocket();
      
      // Говорим серверу: "Я онлайн, добавь мой сокет в комнату с моим ID"
      socket.emit('join', userId);

      // На случай обрыва связи переподключаемся
      socket.on('connect', () => {
        socket.emit('join', userId);
      });
    }
  }, [userId]);

  if (isLoading) return null;

  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <NavigationProvider>
      <Toaster position="top-center" reverseOrder={false} />
      
      <Routes location={background || location}>
        
        {/* --- ПУБЛИЧНЫЕ МАРШРУТЫ (Без Layout) --- */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/reset-password/:username" element={<Reset />} />

        {/* --- ПРИВАТНЫЕ МАРШРУТЫ (Внутри Layout) --- */}
        {isAuthenticated ? (
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/explore" element={<Explore />} />

            {/* 🔥 ВОТ ЭТУ СТРОКУ ТЫ ЗАБЫЛА ДОБАВИТЬ В СПИСОК: */}
            <Route path="/post/:id" element={<PostPage />} />

            {/* Маршруты сообщений */}
            <Route path="/direct" element={<Navigate to="/direct/inbox" replace />} />
            <Route path="/direct/inbox" element={<MessagesPage />} />
            
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