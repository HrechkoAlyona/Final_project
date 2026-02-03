import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Reset from './pages/Reset'; 

function App() {
  // Проверяем, есть ли токен (вошел ли пользователь)
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <>
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Маршруты для сброса пароля */}
        <Route path="/reset" element={<Reset />} />
        <Route path="/reset-password/:username" element={<Reset />} />
        
        {/* Защищенный маршрут: Если вошел -> Домой, иначе -> Логин */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Home /> : <Navigate to="/login" />} 
        />
      </Routes>
    </>
  );
}

export default App;