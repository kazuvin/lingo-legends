import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/utils/cn';

const toastVariants = cva(
  'fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all duration-300 min-w-[300px]',
  {
    variants: {
      variant: {
        default: 'bg-background border-border text-foreground',
        success:
          'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-100',
        error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-100',
        warning:
          'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100',
      },
      state: {
        visible: 'translate-x-0 opacity-100',
        hidden: 'translate-x-full opacity-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      state: 'visible',
    },
  },
);

type ToastProps = VariantProps<typeof toastVariants> & {
  children: React.ReactNode;
  onClose?: () => void;
  duration?: number;
};

export function Toast({ children, variant = 'default', state = 'visible', onClose, duration = 3000 }: ToastProps) {
  React.useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={cn(toastVariants({ variant, state }))}>
      {children}
      {onClose && (
        <button onClick={onClose} className="ml-auto text-sm text-current/60 hover:text-current">
          ×
        </button>
      )}
    </div>
  );
}
