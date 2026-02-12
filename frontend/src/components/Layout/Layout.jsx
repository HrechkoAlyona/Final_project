// frontend\src\components\Layout\Layout.jsx

import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom'; 
import Sidebar from '../Sidebar/Sidebar';
import SearchSidebar from '../SearchSidebar/SearchSidebar';
import Notifications from '../Notifications/Notifications'; 
import CreatePostModal from '../CreatePostModal/CreatePostModal'; 
import { Footer } from '../Footer/Footer'; 
import { NavigationContext } from '../../context/NavigationContext'; 
import s from './Layout.module.scss';

const Layout = () => { 
  // Берем активную вкладку и функцию смены из контекста
  const { activeTab, setActiveTab } = useContext(NavigationContext);

  // Универсальная функция закрытия — возвращаем состояние в 'home'
  const closeModals = () => setActiveTab('home');

  return (
    <div className={s.layoutWrapper}>
      {/* Сайдбар: onCreateClick теперь тоже меняет глобальный tab */}
      <Sidebar 
        onCreateClick={() => setActiveTab('create')} 
        isCreateOpen={activeTab === 'create'} 
      />
      
      {/* Панель поиска: открывается, если в футере/сайдбаре нажали 'search' */}
      <SearchSidebar 
        isOpen={activeTab === 'search'} 
        onClose={closeModals} 
      />

      {/* Панель уведомлений: открывается, если нажали 'notifications' */}
      <Notifications 
        isOpen={activeTab === 'notifications'} 
        onClose={closeModals} 
      />

      <main className={s.mainContent}>
          <Outlet /> 
      </main>

      <Footer />

      {/* Модальное окно создания поста */}
      {activeTab === 'create' && (
        <CreatePostModal onClose={closeModals} />
      )}
    </div>
  );
};

export default Layout;