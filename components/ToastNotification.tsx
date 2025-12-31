
import React, { useEffect } from 'react';
import { Toast } from '../types';

interface ToastNotificationProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const bgColors = {
    success: 'bg-gray-800 dark:bg-gray-700 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
  };

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle',
  };

  return (
    <div className={`${bgColors[toast.type]} shadow-lg rounded-lg p-3 flex items-center justify-between pointer-events-auto animate-fade-in-up transition-all transform`}>
      <div className="flex items-center gap-3">
        <i className={`fas ${icons[toast.type]}`}></i>
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
      <div className="flex items-center gap-3">
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              onDismiss(toast.id);
            }}
            className="text-sm font-bold uppercase tracking-wide text-indigo-300 hover:text-indigo-100 transition-colors"
          >
            {toast.action.label}
          </button>
        )}
        <button onClick={() => onDismiss(toast.id)} className="opacity-70 hover:opacity-100">
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;
