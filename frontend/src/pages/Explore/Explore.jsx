// frontend/src/pages/Explore/Explore.jsx
import React, { useState } from "react";
import { AiFillHeart } from "react-icons/ai";
import { FaComment } from "react-icons/fa";
import { useGetExplorePostsQuery } from "../../services/api";
import PostModal from "../../components/PostModal/PostModal";
import s from "./Explore.module.scss";

const Explore = () => {
  const { data: posts = [], isLoading } = useGetExplorePostsQuery();

  const [selectedPost, setSelectedPost] = useState(null);

  if (isLoading) return <div className={s.loader}>Loading...</div>;

  return (
    <div className={s.exploreContainer}>
      <div className={s.grid}>
        {posts.map((post) => (
          <div
            key={post._id}
            className={s.gridItem}
            onClick={() => setSelectedPost(post)}
          >
            <img src={post.image} alt="explore" />

            {/* Оверлей */}
            <div className={s.overlay}>
              <div className={s.statItem}>
                <AiFillHeart />
                <span>{post.likes?.length || 0}</span>
              </div>
              <div className={s.statItem}>
                <FaComment />
                <span>{post.comments?.length || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && !isLoading && (
        <div className={s.emptyState}>No posts found.</div>
      )}

      {selectedPost && (
        <PostModal
          key={selectedPost._id}
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
};

export default Explore;
