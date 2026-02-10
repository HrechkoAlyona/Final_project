// frontend\src\hooks\useChatSocket.js

import { useEffect } from 'react';
import { getSocket } from '../services/api'; 
import { useAuth } from './useAuth';

export const useChatSocket = () => {
  const { user } = useAuth();
  const socket = getSocket();

  useEffect(() => {
    // Подключаемся к комнате, только если есть user и socket
    if (user?._id && socket) {
      socket.emit('join', user._id);
    }
  }, [user, socket]); 

  return socket;
};