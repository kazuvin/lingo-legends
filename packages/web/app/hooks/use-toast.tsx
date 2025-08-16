import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Toast } from '~/components/ui/toast';

type ToastOptions = {
  variant?: 'default' | 'success' | 'error' | 'warning';
  duration?: number;
};

export function useToast() {
  const showToast = React.useCallback((message: string, options: ToastOptions = {}) => {
    const { variant = 'default', duration = 3000 } = options;

    // Create a container for the toast
    const container = document.createElement('div');
    document.body.appendChild(container);

    const root = createRoot(container);

    const handleClose = () => {
      root.unmount();
      document.body.removeChild(container);
    };

    root.render(
      <Toast variant={variant} duration={duration} onClose={handleClose}>
        {message}
      </Toast>,
    );
  }, []);

  return { showToast };
}

