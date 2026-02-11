// frontend\src\hooks\useGetHomePage.js

import { useEffect, useState, useCallback } from "react";
import { useLazyGetFollowedPostsQuery, useGetMeQuery } from "../services/api";

export const useGetHomePage = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { data: user } = useGetMeQuery(); 
  const [fetchFollowedPosts, { isLoading, isFetching, error }] = useLazyGetFollowedPostsQuery();

  const fetchPosts = useCallback(async () => {
    if (!hasMore || isFetching) return;

    try {
      const response = await fetchFollowedPosts(page).unwrap();
      const newPosts = Array.isArray(response) ? response : response.posts;

      if (newPosts && newPosts.length > 0) {
        setPosts((prev) => {
          const combined = [...prev, ...newPosts];
          // Убираем дубликаты
          const uniquePosts = Array.from(new Map(combined.map(item => [item._id, item])).values());
          return uniquePosts;
        });
        setPage((prev) => prev + 1);
        if (newPosts.length < 4) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    }
  }, [page, hasMore, isFetching, fetchFollowedPosts]);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    posts,
    hasMore,
    user,
    fetchPosts,
    isLoadingF: isLoading,
    isFetchingF: isFetching,
    error,
  };
};