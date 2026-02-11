import React, { useEffect } from 'react';
/* 🔥 Меняем импорт на специализированный сервис */
import { useGetNotificationsQuery, useMarkNotificationsReadMutation } from '../../services/notificationsApi';
import NotificationItem from './NotificationItem';
import s from './Notifications.module.scss';

const Notifications = ({ isOpen, onClose }) => {
  const { data: notifications = [], isLoading } = useGetNotificationsQuery(undefined, {
      skip: !isOpen, 
  });

  const [markRead] = useMarkNotificationsReadMutation();

  // Когда панель открыта, помечаем всё как прочитанное
  useEffect(() => {
    if (isOpen && notifications.length > 0) {
       const hasUnread = notifications.some(n => !n.isRead);
       if (hasUnread) {
           markRead();
       }
    }
  }, [isOpen, notifications, markRead]);

  if (!isOpen) return null;

  return (
    <div className={s.drawerContainer}>
        <div className={s.header}>
            <h2>Notifications</h2>
        </div>

        <div className={s.list}>
            {isLoading && <div className={s.loading}>Loading...</div>}
            
            {!isLoading && notifications.length === 0 && (
                <div className={s.empty}>No notifications yet.</div>
            )}

            {notifications.map(notif => (
                <NotificationItem 
                    key={notif._id} 
                    notification={notif} 
                    onClose={onClose}
                />
            ))}
        </div>
    </div>
  );
};

export default Notifications;