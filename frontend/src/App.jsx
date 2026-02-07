import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Страницы
import Login from './pages/Login'; 
import Register from './pages/Register'; 
import Home from './pages/Home';
import Reset from './pages/Reset';
import ProfilePage from './pages/ProfilePage/ProfilePage'; 
import EditProfile from './pages/EditProfile/EditProfile';
import NotFound from './pages/NotFound/NotFound';

// Компоненты
import Layout from './components/Layout/Layout';

// Контекст
import { NavigationProvider } from './context/NavigationProvider';

function App() {
  // Простая проверка авторизации по наличию токена
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <NavigationProvider>
      {/* Уведомления (Toasts) */}
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }} 
      />
      
      <Routes>
        {/* --- 1. ПУБЛИЧНЫЕ МАРШРУТЫ (Без Layout) --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/reset-password/:username" element={<Reset />} />
        
        {/* --- 2. ПРИВАТНЫЕ МАРШРУТЫ (С Layout: Сайдбар + Футер) --- */}
        
        {/* Главная */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Layout>
                <Home />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* Профиль пользователя */}
        <Route 
          path="/profile/:id" 
          element={
            isAuthenticated ? (
              <Layout>
                <ProfilePage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* Редактирование профиля */}
        <Route 
          path="/edit-profile" 
          element={
            isAuthenticated ? (
              <Layout>
                <EditProfile />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="*" 
          element={
            <Layout>
              <NotFound />
            </Layout>
          } 
        />

      </Routes>
    </NavigationProvider>
  );
}

export default App;