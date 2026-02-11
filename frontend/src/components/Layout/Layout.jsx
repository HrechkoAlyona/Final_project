// frontend\src\components\Layout\Layout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom'; 
import Sidebar from '../Sidebar/Sidebar';
import CreatePostModal from '../CreatePostModal/CreatePostModal'; 
import { Footer } from '../Footer/Footer'; 
import s from './Layout.module.scss';

const Layout = () => { 
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className={s.layoutWrapper}>
      <Sidebar 
        onCreateClick={() => setCreateModalOpen(true)} 
        isCreateOpen={isCreateModalOpen} 
      />
      
      <main className={s.mainContent}>
          <Outlet /> 
      </main>

      <Footer />

      {isCreateModalOpen && (
        <CreatePostModal onClose={() => setCreateModalOpen(false)} />
      )}
    </div>
  );
};

export default Layout;