// frontend/src/pages/Home/Home.jsx
import React, { useState, useEffect, useRef } from "react";
import { useGetFollowedPostsQuery } from "../../services/api";
import HomePost from "../../components/HomePost/HomePost";
import PostModal from "../../components/PostModal/PostModal";
import s from "./Home.module.scss";
import CheckIcon from "../../components/logos/CheckIcon";

const Home = () => {
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const observerRef = useRef(null); // 1. Реф для отслеживания элемента внизу страницы

  // Получаем данные
  const {
    data: newPosts,
    isLoading,
    isFetching,
  } = useGetFollowedPostsQuery(page);

  // Логика объединения постов (добавляем новые к старым)
  useEffect(() => {
    if (newPosts && newPosts.length > 0) {
      const timer = setTimeout(() => {
        setAllPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p._id));
          const uniqueIncoming = newPosts.filter(
            (p) => !existingIds.has(p._id),
          );

          if (uniqueIncoming.length === 0) return prev;

          return [...prev, ...uniqueIncoming];
        });
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [newPosts]);

  const hasMore = newPosts && newPosts.length > 0; // Определяем, есть ли еще посты на сервере.

  //  Логика Infinite Scroll (Бесконечная прокрутка)
  useEffect(() => {
    if (isFetching || !hasMore) return; // Не запускаем наблюдатель, если уже идет загрузка или посты закончились
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

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
  if (isLoading && page === 1)
    return <div className={s.loader}>Loading feed...</div>;

  return (
    <div className={s.pageWrapper}>
      <div className={s.feedGrid}>
        {allPosts.map((post) => (
          <div key={post._id} className={s.gridItem}>
            <HomePost post={post} onPostClick={() => setSelectedPost(post)} />
          </div>
        ))}
      </div>

      <div className={s.statusContainer}>
        {/* Показываем лоадер, если подгружаем страницу 2 и далее */}
        {isFetching && page > 1 && (
          <div className={s.loaderSmall}>Loading more...</div>
        )}

        {!isFetching && hasMore && (
          <div
            ref={observerRef}
            style={{ height: "20px", width: "100%" }}
          ></div>
        )}

        {/* Если hasMore = false и загрузка не идет — значит, мы дошли до конца */}
        {!hasMore && !isFetching && allPosts.length > 0 && (
          <div className={s.allCaughtUp}>
            <div className={s.checkIcon}>
              <CheckIcon />
            </div>
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
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
};

export default Home;
