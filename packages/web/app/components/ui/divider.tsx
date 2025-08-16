import * as React from 'react';
import { cn } from '~/utils';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
}

function Divider({ className, children, orientation = 'horizontal', ...props }: DividerProps) {
  return (
    <div
      className={cn(
        'relative',
        orientation === 'horizontal' ? 'w-full' : 'h-full',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'absolute bg-border',
          orientation === 'horizontal' 
            ? 'inset-0 h-px top-1/2 -translate-y-1/2'
            : 'inset-0 w-px left-1/2 -translate-x-1/2'
        )}
      />
      {children && (
        <div className="relative flex justify-center">
          <span className="bg-background px-2 text-xs text-muted-foreground">
            {children}
          </span>
        </div>
      )}
    </div>
  );
}

export { Divider };