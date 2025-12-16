// hooks/useModal.ts
import { useState } from 'react';

type ModalVariant = 'success' | 'error' | 'confirm' | 'info';

type ModalConfig = {
  title?: string;
  description?: string;
  variant?: ModalVariant;
  confirmText?: string;
  cancelText?: string;
  hideCancel?: boolean;
  onConfirm?: () => void;
};

export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ModalConfig>({
    variant: 'info',
    confirmText: 'OK',
    cancelText: 'Cancelar',
  });

  const openModal = (options: ModalConfig) => {
    setConfig(prev => ({
      ...prev,
      ...options,
    }));
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  // atalhos úteis
  const openSuccess = (title: string, description?: string) =>
    openModal({
      title,
      description,
      variant: 'success',
      hideCancel: true,
      confirmText: 'Fechar',
      onConfirm: closeModal,
    });

  const openError = (title: string, description?: string) =>
    openModal({
      title,
      description,
      variant: 'error',
      hideCancel: true,
      confirmText: 'Entendi',
      onConfirm: closeModal,
    });

  const openInfo = (title: string, description?: string) =>
    openModal({
      title,
      description,
      variant: 'info',
      hideCancel: true,
      confirmText: 'OK',
      onConfirm: closeModal,
    });

  const openConfirm = (
    title: string,
    description: string,
    onConfirm: () => void,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
  ) =>
    openModal({
      title,
      description,
      variant: 'confirm',
      hideCancel: false,
      confirmText,
      cancelText,
      onConfirm: () => {
        onConfirm();
        closeModal();
      },
    });

  return {
    isOpen,
    config,
    openModal,
    closeModal,
    openSuccess,
    openError,
    openInfo,
    openConfirm,
  };
};
