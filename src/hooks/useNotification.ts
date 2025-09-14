import { useState, useCallback } from 'react';
import type { NotificationState } from '../types';

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    type: 'info',
    message: '',
    isVisible: false
  });

  const showNotification = useCallback((
    type: NotificationState['type'],
    message: string,
    duration = 5000
  ) => {
    setNotification({
      type,
      message,
      isVisible: true,
      duration
    });

    if (duration > 0) {
      setTimeout(() => {
        setNotification(prev => ({ ...prev, isVisible: false }));
      }, duration);
    }
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  }, []);

  return {
    notification,
    showNotification,
    hideNotification
  };
};