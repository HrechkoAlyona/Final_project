import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import CreatePostModal from '../CreatePostModal/CreatePostModal'; 
import { Footer } from '../Footer/Footer'; 
import s from './Layout.module.scss';

const Layout = ({ children }) => {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className={s.layoutWrapper}>
      <Sidebar onCreateClick={() => setCreateModalOpen(true)} />
      
      {/* Основной контент страницы */}
      <main className={s.mainContent}>
         {children}
      </main>

      {/*  2. Вставляем Футер после контента */}
      <Footer />

      {isCreateModalOpen && (
        <CreatePostModal onClose={() => setCreateModalOpen(false)} />
      )}
    </div>
  );
};

export default Layout;