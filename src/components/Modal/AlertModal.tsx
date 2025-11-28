import React, { useEffect } from 'react';
import type { AlertModalProps } from './typeModal';

export const Modal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'success',
  showCloseButton = true,
  children,
}) => {
  // Fechar modal com ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Evita scroll ao abrir modal
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Cores baseadas no tipo
  const typeStyles = {
    success: {
      icon: '✅',
      border: 'border-green-500',
      bg: 'bg-green-50',
      text: 'text-green-800',
    },
    error: {
      icon: '❌',
      border: 'border-red-500',
      bg: 'bg-red-50',
      text: 'text-red-800',
    },
    warning: {
      icon: '⚠️',
      border: 'border-yellow-500',
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
    },
    info: {
      icon: 'ℹ️',
      border: 'border-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
    },
  };

  const styles = typeStyles[type];

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50'>
      <div
        className={`relative bg-white rounded-lg shadow-xl w-full max-w-md border-l-4 ${styles.border} ${styles.bg}`}
      >
        {/* Header */}
        <div className='flex items-start justify-between p-6'>
          <div className='flex items-center space-x-3'>
            <span className='text-2xl'>{styles.icon}</span>
            <h3 className={`text-lg font-semibold ${styles.text}`}>{title}</h3>
          </div>

          {showCloseButton && (
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600 transition text-2xl'
            >
              &times;
            </button>
          )}
        </div>

        {/* Content */}
        <div className='px-6 pb-6'>
          {message && <p className={`mt-2 ${styles.text}`}>{message}</p>}
          {children}
        </div>

        {/* Footer */}
        <div className='flex justify-end p-6 pt-0'>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md font-medium transition ${styles.text} hover:opacity-80`}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
