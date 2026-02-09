// frontend/src/pages/Home/Home.jsx
import React, { useState, useEffect } from 'react';
import { useGetFollowedPostsQuery } from '../../services/api'; 
import HomePost from '../../components/HomePost/HomePost'; 
import PostModal from '../../components/PostModal/PostModal'; 
import s from './Home.module.scss';
import CheckIcon from '../../components/logos/CheckIcon';

const Home = () => {
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]); 
  const [selectedPost, setSelectedPost] = useState(null);

  // Получаем данные
  const { data: newPosts, isLoading, isFetching } = useGetFollowedPostsQuery(page);

  useEffect(() => {
    if (newPosts && newPosts.length > 0) {
      // setTimeout делает обновление асинхронным.
      // Это полностью убирает ошибку "Calling setState synchronously..."
      const timer = setTimeout(() => {
        setAllPosts(prev => {
          const existingIds = new Set(prev.map(p => p._id));
          const uniqueIncoming = newPosts.filter(p => !existingIds.has(p._id));
          
          if (uniqueIncoming.length === 0) return prev;
          
          return [...prev, ...uniqueIncoming];
        });
      }, 0);

      // Чистим таймер, если компонент размонтируется
      return () => clearTimeout(timer);
    }
  }, [newPosts]);

  const handleLoadMore = () => setPage(prev => prev + 1);

  if (isLoading && page === 1) return <div className={s.loader}>Loading feed...</div>;

  // Если в newPosts пусто или undefined — значит, больше нечего грузить
  const hasMore = newPosts && newPosts.length > 0;

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
        {isFetching && page > 1 && <div className={s.loaderSmall}>Loading more...</div>}

        {!isFetching && hasMore && allPosts.length > 0 && (
          <button className={s.loadMoreBtn} onClick={handleLoadMore}>
            Load more
          </button>
        )}

        {/* Если hasMore = false, но посты есть — значит мы дошли до конца */}
        {!hasMore && allPosts.length > 0 && (
          <div className={s.allCaughtUp}>
            <div className={s.checkIcon}><CheckIcon /></div>

            <h2>You've seen all the updates</h2>
            <p>You have viewed all new publications</p>
          </div>
        )}
        
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