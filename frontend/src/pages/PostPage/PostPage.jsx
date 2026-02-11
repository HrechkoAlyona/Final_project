import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AiOutlineClose } from 'react-icons/ai'; 
import { FaHeart, FaComment } from 'react-icons/fa'; 
import toast from 'react-hot-toast';
import { 
  useGetPostByIdQuery, 
  useDeletePostMutation, 
  useUpdatePostMutation,
  useGetPostsQuery 
} from '../../services/api';

import s from './PostPage.module.scss'; 

import PostImage from '../../components/PostModal/PostImage';
import PostHeader from '../../components/PostModal/PostHeader';
import PostComments from '../../components/PostModal/PostComments';
import PostActions from '../../components/PostModal/PostActions';
import PostOptions from '../../components/PostModal/PostOptions';

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: post, isLoading, isError } = useGetPostByIdQuery(id);

  // Логика определения ID автора
  const authorId = post?.user?._id || post?.author?._id || post?.user || post?.author;

  // Загружаем посты автора
  const { data: userPosts } = useGetPostsQuery(
    { userId: authorId, limit: 7 }, 
    { skip: !authorId }
  );

  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) return <div className={s.loader}>Loading...</div>;
  if (isError || !post) return <div className={s.loader}>Post not found</div>;

  const currentUserId = localStorage.getItem('userId');
  const authorData = post.user || post.author; 
  const isMyPost = String(currentUserId) === String(authorData?._id);

  const otherPosts = userPosts?.filter(p => p._id !== id).slice(0, 6) || [];

  const handleGoBack = () => navigate(-1);

  const handleEditMode = () => {
    setEditContent(post.description || "");
    setEditTitle(post.title || "");
    setIsEditing(true);
    setShowOptions(false);
  };

  const handleSaveEdit = async () => {
    try {
      const formData = new FormData();
      formData.append('description', editContent);
      formData.append('title', editTitle);
      if (selectedFile) formData.append('image', selectedFile);

      await updatePost({ id: post._id, body: formData }).unwrap();
      toast.success("Post updated!");
      setIsEditing(false);
    } catch (err) {
      console.error("Save edit error:", err);
      toast.error("Failed to update post");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure?")) {
      try {
        await deletePost(post._id).unwrap();
        toast.success("Post deleted");
        navigate('/'); 
      } catch {
        toast.error("Error deleting post");
      }
    }
  };

  return (
    <div className={s.pageWrapper}>
      <button onClick={handleGoBack} className={s.pageCloseBtn} title="Close">
        <AiOutlineClose size={32} />
      </button>

      {/* Обертка для центрирования всего контента */}
      <div className={s.mainContent}>
        <div className={s.modalCard}>
          <div className={s.mediaSection}>
             <PostImage 
               post={post} 
               isEditing={isEditing} 
               editTitle={editTitle} 
               setEditTitle={setEditTitle} 
               previewUrl={previewUrl}
               onFileChange={(e) => {
                 const file = e.target.files[0];
                 if (file) {
                   setSelectedFile(file);
                   setPreviewUrl(URL.createObjectURL(file));
                 }
               }}
             />
          </div>

          <div className={s.contentSection}>
            <PostHeader 
              authorData={authorData}
              isEditing={isEditing}
              isUpdating={isUpdating}
              onCancel={() => setIsEditing(false)}
              onSave={handleSaveEdit}
              onShowOptions={() => setShowOptions(true)}
              onClose={handleGoBack} 
            />
            <PostComments 
              post={post}
              authorData={authorData}
              isEditing={isEditing}
              editContent={editContent}
              setEditContent={setEditContent}
            />
            {!isEditing && <PostActions post={post} />}
          </div>
        </div>

        {otherPosts.length > 0 && (
          <div className={s.morePostsContainer}>
            <h3 className={s.morePostsTitle}>
              More posts from <span>{authorData?.username}</span>
            </h3>
            <div className={s.morePostsGrid}>
              {otherPosts.map(p => (
                <div key={p._id} className={s.gridItem} onClick={() => navigate(`/post/${p._id}`)}>
                  <img src={p.image} alt="Other post" />
                  <div className={s.gridOverlay}>
                    <span><FaHeart /> {p.likes?.length || 0}</span>
                    <span><FaComment /> {p.comments?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showOptions && (
        <PostOptions 
          isMyPost={isMyPost}
          isDeleting={isDeleting}
          onDelete={handleDelete}
          onEdit={handleEditMode}
          onClose={() => setShowOptions(false)}
          postId={post._id}
        />
      )}
    </div>
  );
};

export default PostPage;