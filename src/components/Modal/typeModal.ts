export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  showCloseButton?: boolean;
  children?: React.ReactNode;
}
