import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Страницы
import Login from './pages/Auth/Login'; 
import Register from './pages/Auth/Register'; 
import Reset from './pages/Auth/Reset';
import Home from './pages/Home/Home';
import ProfilePage from './pages/ProfilePage/ProfilePage'; 
import EditProfile from './pages/EditProfile/EditProfile';
import Explore from './pages/Explore/Explore'; 
import NotFound from './pages/NotFound/NotFound';

// Компоненты
import Layout from './components/Layout/Layout';

// Контекст и Хуки
import { NavigationProvider } from './context/NavigationProvider';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isLoading } = useAuth();
  const location = useLocation();

  const background = location.state?.backgroundLocation;

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
          // Родительский Route накладывает Layout на все вложенные страницы
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/explore" element={<Explore />} />
            
            <Route path="*" element={<NotFound />} />
          </Route>
        ) : (
          // Если не авторизован — редирект на логин
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>

    </NavigationProvider>
  );
}

export default App;