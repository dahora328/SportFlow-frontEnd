// components/ModalBase.tsx
import React from 'react';

type ModalVariant = 'success' | 'error' | 'confirm' | 'info';

type ModalBaseProps = {
  isOpen: boolean;
  title?: string;
  description?: string;
  variant?: ModalVariant;
  confirmText?: string;
  cancelText?: string;
  hideCancel?: boolean;
  loading?: boolean;
  onConfirm?: () => void;
  onClose: () => void;
  link?: string;
};

const variantStyles: Record<ModalVariant, string> = {
  success: 'border-green-500',
  error: 'border-red-500',
  confirm: 'border-yellow-500',
  info: 'border-blue-500',
};

const variantTitleColor: Record<ModalVariant, string> = {
  success: 'text-green-600',
  error: 'text-red-600',
  confirm: 'text-yellow-600',
  info: 'text-blue-600',
};

export const ModalBase: React.FC<ModalBaseProps> = ({
  isOpen,
  title,
  description,
  variant = 'info',
  confirmText = 'OK',
  cancelText = 'Cancelar',
  hideCancel = false,
  loading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div
        className={`w-full max-w-md rounded-lg bg-white p-5 shadow-lg border-l-4 ${variantStyles[variant]}`}
      >
        {/* Header */}
        <div className='flex items-start justify-between gap-4'>
          <div>
            {title && (
              <h2
                className={`text-lg font-semibold ${variantTitleColor[variant]}`}
              >
                {title}
              </h2>
            )}
            {description && (
              <p className='mt-1 text-sm text-gray-600'>{description}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600'
            type='button'
          >
            ✕
          </button>
        </div>

        {/* Footer */}
        <div className='mt-5 flex justify-end gap-2'>
          {!hideCancel && (
            <button
              type='button'
              onClick={onClose}
              disabled={loading}
              className='rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-60'
            >
              {cancelText}
            </button>
          )}

          <button
            type='button'
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-md px-3 py-1.5 text-sm text-white disabled:opacity-60
            ${
              variant === 'error'
                ? 'bg-red-600 hover:bg-red-700'
                : variant === 'success'
                ? 'bg-green-600 hover:bg-green-700'
                : variant === 'confirm'
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Aguarde...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
