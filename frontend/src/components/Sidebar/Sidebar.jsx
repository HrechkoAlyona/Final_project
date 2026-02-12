// frontend/src/components/Sidebar/Sidebar.jsx

import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  PiHouse,
  PiHouseFill,
  PiMagnifyingGlass,
  PiMagnifyingGlassFill,
  PiCompass,
  PiCompassFill,
  PiMessengerLogo,
  PiMessengerLogoFill,
  PiHeart,
  PiHeartFill,
  PiPlusSquare,
  PiPlusSquareFill,
} from "react-icons/pi";

import LogoMenu from "./LogoMenu";
import SearchSidebar from "../SearchSidebar/SearchSidebar";
import Notifications from "../Notifications/Notifications";
import { useAuth } from "../../hooks/useAuth";
import {
  useGetNotificationsQuery,
  useMarkNotificationsReadMutation,
} from "../../services/notificationsApi";
import { useGetMyConversationsQuery } from "../../services/chatApi";

import s from "./Sidebar.module.scss";

const Sidebar = ({ onCreateClick, isCreateOpen }) => {
  const { userId, me } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const location = useLocation();

  // --- API ---
  const { data: notifications = [] } = useGetNotificationsQuery();
  const { data: conversations = [] } = useGetMyConversationsQuery();
  const [markAsRead] = useMarkNotificationsReadMutation();

  // --- COUNTERS ---
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;
  const unreadMessagesCount = conversations.reduce(
    (acc, conv) => acc + (conv.unreadCount || 0),
    0
  );

  const userAvatar =
    me?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const handleNavClick = (label, action, e) => {
    // Останавливаем всплытие события, чтобы клик не дошел до document
    // и не вызвал ложное срабатывание "клика вне" в компоненте Notifications/Search
    if (e) e.stopPropagation();

    if (label === "Search") {
      setIsNotificationsOpen(false);
      setIsSearchOpen((prev) => !prev);
    } else if (label === "Notifications") {
      setIsSearchOpen(false);
      
      // Логика переключения (Toggle)
      setIsNotificationsOpen((prev) => {
        const nextState = !prev;
        if (nextState) {
            markAsRead(); // Помечаем прочитанным только при открытии
        }
        return nextState;
      });

    } else {
      setIsSearchOpen(false);
      setIsNotificationsOpen(false);
      if (action) action();
    }
  };

  const isMessagesActive = location.pathname.startsWith("/messages");

  const navItems = [
    {
      path: "/",
      label: "Home",
      getIcon: (active) =>
        active ? <PiHouseFill size={26} /> : <PiHouse size={26} />,
    },
    {
      label: "Search",
      getIcon: (active) =>
        active ? (
          <PiMagnifyingGlassFill size={26} />
        ) : (
          <PiMagnifyingGlass size={26} />
        ),
    },
    {
      path: "/explore",
      label: "Explore",
      getIcon: (active) =>
        active ? <PiCompassFill size={26} /> : <PiCompass size={26} />,
    },
    {
      path: "/messages",
      label: "Messages",
      getIcon: (active) =>
        active ? (
          <PiMessengerLogoFill size={26} />
        ) : (
          <PiMessengerLogo size={26} />
        ),
      badge: unreadMessagesCount,
    },
    {
      label: "Notifications",
      getIcon: (active) =>
        active ? <PiHeartFill size={26} /> : <PiHeart size={26} />,
      badge: unreadNotifsCount,
    },
    {
      label: "Create",
      action: onCreateClick,
      getIcon: (active) =>
        active ? <PiPlusSquareFill size={26} /> : <PiPlusSquare size={26} />,
    },
    { path: `/profile/${userId}`, label: "Profile" },
  ];

  return (
    <>
      <aside className={s.sidebar}>
        <LogoMenu />
        <nav className={s.nav}>
          {navItems.map((item) => {
            const isProfile = item.label === "Profile";

            const renderIcon = (isActive = false) => (
              <div className={s.iconWrapper}>
                {isProfile ? (
                  <img
                    src={userAvatar}
                    alt="profile"
                    className={s.profileAvatar}
                  />
                ) : item.getIcon ? (
                  item.getIcon(isActive)
                ) : (
                  item.icon
                )}
                {item.badge > 0 && (
                  <div className={s.counterBadge}>
                    {item.badge > 9 ? "9+" : item.badge}
                  </div>
                )}
              </div>
            );

            // Для кнопок без пути (Search, Notifications, Create)
            if (!item.path) {
              const isActiveBtn =
                (item.label === "Search" && isSearchOpen) ||
                (item.label === "Notifications" && isNotificationsOpen) ||
                (item.label === "Create" && isCreateOpen);

              return (
                <div
                  key={item.label}
                  className={`${s.navItem} ${isActiveBtn ? s.activeItem : ""}`}
                  // Передаем 'e' обязательно!
                  onClick={(e) => handleNavClick(item.label, item.action, e)}
                >
                  {renderIcon(isActiveBtn)}
                  <span className={isActiveBtn ? s.activeItem : ""}>
                    {item.label}
                  </span>
                </div>
              );
            }

            // Для обычных ссылок (Home, Explore, Messages, Profile)
            return (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.path === "/"}
                // Закрываем окна при переходе на другую страницу
                onClick={() => {
                   setIsSearchOpen(false);
                   setIsNotificationsOpen(false);
                }}
                className={({ isActive }) => {
                  const activeState =
                    isActive || (item.label === "Messages" && isMessagesActive);
                  return `${s.navItem} ${
                    activeState ? s.activeItem : ""
                  } ${isProfile ? s.profileItem : ""}`;
                }}
              >
                {({ isActive }) => {
                  const activeState =
                    isActive || (item.label === "Messages" && isMessagesActive);
                  return (
                    <>
                      {renderIcon(activeState)}
                      <span className={activeState ? s.activeItem : ""}>
                        {item.label}
                      </span>
                    </>
                  );
                }}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <SearchSidebar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <Notifications
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
};

export default Sidebar;