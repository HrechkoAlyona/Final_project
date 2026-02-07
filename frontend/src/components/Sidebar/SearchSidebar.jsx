import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineClose, AiOutlineSearch } from 'react-icons/ai';
import { 
  useSearchUsersQuery, 
  useGetMeQuery, 
  useAddToSearchHistoryMutation,
  useClearSearchHistoryMutation,
  useRemoveFromSearchHistoryMutation
} from '../../services/api';
import s from './Sidebar.module.scss'; 

const SearchSidebar = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const myId = localStorage.getItem('userId');

  const { data: me } = useGetMeQuery();

  const { data: searchResults, isLoading } = useSearchUsersQuery(query, {
    skip: query.length < 1, 
  });

  const [addToHistory] = useAddToSearchHistoryMutation();
  const [clearHistory] = useClearSearchHistoryMutation();
  const [removeFromHistory] = useRemoveFromSearchHistoryMutation();

  if (!isOpen) return null;

  // --- ОБРАБОТЧИКИ ---

  const handleUserClick = async (user) => {
    navigate(`/profile/${user._id}`);
    onClose();
    if (user._id !== myId) {
        try { await addToHistory(user._id).unwrap(); } catch (e) { console.error(e); }
    }
    setQuery('');
  };

  const handleClearAll = async (e) => {
    e.stopPropagation();
    if(window.confirm('Clear search history?')) {
        await clearHistory();
    }
  };

  const handleRemoveOne = async (e, userId) => {
      e.stopPropagation();
      await removeFromHistory(userId);
  };

  return (
    <>
      {/*1. ПОДЛОЖКА: Клик сюда закрывает поиск */}
      <div className={s.overlay} onClick={onClose}></div>

      {/* САМА ПАНЕЛЬ ПОИСКА */}
      <div className={s.searchDrawer}> 
        <div className={s.searchHeader}>
          <h2>Search</h2>
          <div className={s.searchInputWrapper}>
             <AiOutlineSearch className={s.searchIcon} />
             <input 
               type="text" 
               placeholder="Search" 
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               autoFocus
             />
             <div className={s.closeBtn} onClick={() => { setQuery(''); }}>
               <AiOutlineClose />
             </div>
          </div>
        </div>

        <div className={s.divider}></div>
        
        <div className={s.searchResults}>
          
          {/* РЕЗУЛЬТАТЫ ПОИСКА */}
          {query.length > 0 && (
              <>
                  {isLoading && <div className={s.loading}>Searching...</div>}
                  {!isLoading && searchResults && searchResults.length === 0 && (
                      <div className={s.noResults}>No results found.</div>
                  )}
                  {searchResults?.map((user) => (
                      <div key={user._id} className={s.userItem} onClick={() => handleUserClick(user)}>
                          <img src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt={user.username} />
                          <div className={s.userInfo}>
                              <span className={s.username}>{user.username}</span>
                              <span className={s.fullname}>{user.fullName}</span>
                          </div>
                      </div>
                  ))}
              </>
          )}

          {/* ИСТОРИЯ */}
          {query.length === 0 && (
              <>
                  <div style={{ padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', fontSize: '16px' }}>Recent</span>
                      {me?.search?.length > 0 && (
                          <span style={{ color: '#0095f6', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }} onClick={handleClearAll}>
                              Clear all
                          </span>
                      )}
                  </div>

                  {(!me?.search || me.search.length === 0) && <div className={s.noResults}>No recent searches.</div>}

                  {me?.search?.map((user) => (
                      <div key={user._id} className={s.userItem} onClick={() => handleUserClick(user)}>
                          <img src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt={user.username} />
                          <div className={s.userInfo}>
                              <span className={s.username}>{user.username}</span>
                              <span className={s.fullname}>{user.fullName}</span>
                          </div>
                          <div style={{ marginLeft: 'auto', color: '#8e8e8e', padding: '8px' }} onClick={(e) => handleRemoveOne(e, user._id)}>
                              <AiOutlineClose size={14} />
                          </div>
                      </div>
                  ))}
              </>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchSidebar;