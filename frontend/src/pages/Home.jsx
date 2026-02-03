import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Удаляем токен и отправляем на вход
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>🎉 Ура! Ты внутри системы!</h1>
      <p>Здесь скоро будет лента постов.</p>
      
      <button 
        onClick={handleLogout}
        style={{ padding: '10px 20px', background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}
      >
        Выйти (Log out)
      </button>
    </div>
  );
};

export default Home;