// frontend/src/components/Sidebar/SearchSidebar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineClose, AiOutlineSearch } from "react-icons/ai";
import {
  useSearchUsersQuery,
  useGetMeQuery,
  useAddToSearchHistoryMutation,
  useClearSearchHistoryMutation,
  useRemoveFromSearchHistoryMutation,
} from "../../services/api";
import s from "./SearchSidebar.module.scss";

const UserListItem = ({ user, onClick, onRemove }) => (
  <div className={s.userItem} onClick={() => onClick(user)}>
    <img
      src={
        user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
      }
      alt={user.username}
    />
    <div className={s.userInfo}>
      <span className={s.username}>{user.username}</span>
      <span className={s.fullname}>{user.fullName || user.username}</span>
    </div>

    {onRemove && (
      <div
        className={s.removeHistoryBtn}
        onClick={(e) => onRemove(e, user._id)}
      >
        <AiOutlineClose size={14} />
      </div>
    )}
  </div>
);

const SearchSidebar = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const { data: me } = useGetMeQuery();
  const myId = me?._id;

  const { data: searchResults, isLoading } = useSearchUsersQuery(query, {
    skip: query.length < 1,
  });

  const [addToHistory] = useAddToSearchHistoryMutation();
  const [clearHistory] = useClearSearchHistoryMutation();
  const [removeFromHistory] = useRemoveFromSearchHistoryMutation();

  if (!isOpen) return null;

  const handleUserClick = async (user) => {
    navigate(`/profile/${user._id}`);
    onClose();
    if (user._id !== myId) {
      try {
        await addToHistory(user._id).unwrap();
      } catch (e) {
        console.error(e);
      }
    }
    setQuery("");
  };

  const handleClearAll = async (e) => {
    e.stopPropagation();
    if (window.confirm("Clear search history?")) {
      await clearHistory();
    }
  };

  const handleRemoveOne = async (e, userId) => {
    e.stopPropagation();
    await removeFromHistory(userId);
  };

  const isQueryEmpty = query.length === 0;

  return (
    <>
      <div className={s.overlay} onClick={onClose}></div>
      <div className={s.searchDrawer}>
        <div className={s.searchHeader}>
          <div className={s.headerTop}>
            <h2>Search</h2>
            <button className={s.closeDrawerBtn} onClick={onClose}>
                <AiOutlineClose />
            </button>
          </div>

          <div className={s.searchInputWrapper}>
            <AiOutlineSearch className={s.searchIcon} />
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <div className={s.closeBtn} onClick={() => setQuery("")}>
                <AiOutlineClose />
              </div>
            )}
          </div>
        </div>

        <div className={s.divider}></div>

        <div className={s.searchResults}>
          {!isQueryEmpty && (
            <>
              {isLoading && <div className={s.loading}>Searching...</div>}
              {!isLoading && searchResults?.length === 0 && (
                <div className={s.noResults}>No results found.</div>
              )}
              {searchResults?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  onClick={handleUserClick}
                />
              ))}
            </>
          )}

          {isQueryEmpty && (
            <>
              <div className={s.recentHeader}>
                <span>Recent</span>
                {me?.search?.length > 0 && (
                  <span className={s.clearAllBtn} onClick={handleClearAll}>
                    Clear all
                  </span>
                )}
              </div>
              {(!me?.search || me.search.length === 0) && (
                <div className={s.noResults} style={{ marginTop: 50 }}>
                  No recent searches.
                </div>
              )}
              {me?.search?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  onClick={handleUserClick}
                  onRemove={handleRemoveOne}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchSidebar;