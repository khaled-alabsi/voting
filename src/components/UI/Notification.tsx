import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { NotificationState } from '../../types';

interface NotificationProps {
  notification: NotificationState;
  onClose: () => void;
}

export const Notification = ({ notification, onClose }: NotificationProps) => {
  useEffect(() => {
    if (notification.isVisible && notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification.isVisible) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-white" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-white" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-white" />;
      default:
        return <Info className="w-5 h-5 text-white" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      default:
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`w-80 ${getBackgroundColor()} rounded-lg shadow-lg p-4`}>
        <div className="flex items-center space-x-3">
          <div>
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">
              {notification.message}
            </p>
          </div>
          <div>
            <button
              type="button"
              className="text-white opacity-70 hover:opacity-100 transition-opacity p-1 rounded hover:bg-white hover:bg-opacity-20"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};