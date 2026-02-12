// frontend/src/pages/Home/Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useGetFollowedPostsQuery } from '../../services/api'; 
import HomePost from '../../components/HomePost/HomePost'; 
import PostModal from '../../components/PostModal/PostModal'; 
import s from './Home.module.scss';
import CheckIcon from '../../components/logos/CheckIcon';

const Home = () => {
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]); 
  const [selectedPost, setSelectedPost] = useState(null);

  // 1. Реф для отслеживания элемента внизу страницы
  const observerRef = useRef(null);

  // Получаем данные
  const { data: newPosts, isLoading, isFetching } = useGetFollowedPostsQuery(page);

  // Логика объединения постов (добавляем новые к старым)
  useEffect(() => {
    if (newPosts && newPosts.length > 0) {
      const timer = setTimeout(() => {
        setAllPosts(prev => {
          const existingIds = new Set(prev.map(p => p._id));
          const uniqueIncoming = newPosts.filter(p => !existingIds.has(p._id));
          
          if (uniqueIncoming.length === 0) return prev;
          
          return [...prev, ...uniqueIncoming];
        });
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [newPosts]);

  // Определяем, есть ли еще посты на сервере.
  // Если пришел пустой массив или null, считаем, что все загружено.
  const hasMore = newPosts && newPosts.length > 0;

  // 2. 🔥 Логика Infinite Scroll (Бесконечная прокрутка)
  useEffect(() => {
    // Не запускаем наблюдатель, если уже идет загрузка или посты закончились
    if (isFetching || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      // Если невидимый элемент появился на экране
      if (entries[0].isIntersecting) {
        setPage(prev => prev + 1); // Грузим следующую страницу
      }
    }, {
      root: null,
      rootMargin: '100px', // Начинаем грузить заранее (за 100px до низа)
      threshold: 0.1
    });

    // ✅ Сохраняем текущий элемент в переменную для безопасной очистки (cleanup)
    const currentTarget = observerRef.current;

    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [isFetching, hasMore]); 

  // Начальная загрузка первой страницы
  if (isLoading && page === 1) return <div className={s.loader}>Loading feed...</div>;

  return (
    <div className={s.pageWrapper}>
      
      <div className={s.feedGrid}>
        {allPosts.map(post => (
          <div key={post._id} className={s.gridItem}>
             <HomePost 
                post={post} 
                onPostClick={() => setSelectedPost(post)} 
             />
          </div>
        ))}
      </div>

      <div className={s.statusContainer}>
        {/* Показываем лоадер, если подгружаем страницу 2 и далее */}
        {isFetching && page > 1 && <div className={s.loaderSmall}>Loading more...</div>}

        {/* 🔥 ЭЛЕМЕНТ-ТРИГГЕР
            Рендерится только если:
            1. Мы сейчас НЕ грузим данные (!isFetching)
            2. Данные еще есть (hasMore)
            Как только скролл дойдет до этого div, сработает useEffect выше.
        */}
        {!isFetching && hasMore && (
           <div ref={observerRef} style={{ height: '20px', width: '100%' }}></div>
        )}

        {/* Если hasMore = false и загрузка не идет — значит, мы дошли до конца */}
        {!hasMore && !isFetching && allPosts.length > 0 && (
          <div className={s.allCaughtUp}>
            <div className={s.checkIcon}><CheckIcon /></div>
            <h2>You've seen all the updates</h2>
            <p>You have viewed all new publications</p>
          </div>
        )}
        
        {/* Если вообще нет постов (даже на 1 странице) */}
        {!isLoading && allPosts.length === 0 && !hasMore && (
            <div className={s.emptyState}>
                <h2>Welcome to Ichgram!</h2>
                <p>Subscribe to users to see their photos here.</p>
            </div>
        )}
      </div>

      {selectedPost && (
        <PostModal 
          post={selectedPost} 
          onClose={() => setSelectedPost(null)} 
        />
      )}
    </div>
  );
};

export default Home;