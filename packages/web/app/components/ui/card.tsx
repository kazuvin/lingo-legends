import * as React from 'react';
import { cn } from '~/utils';

function Card({ ref, className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      ref={ref}
      className={cn('border-border bg-card text-card-foreground rounded-lg border', className)}
      {...props}
    />
  );
}

function CardHeader({ ref, className, ...props }: React.ComponentProps<'div'>) {
  return <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />;
}

function CardTitle({ ref, className, ...props }: React.ComponentProps<'h3'>) {
  return <h3 ref={ref} className={cn('text-2xl leading-none font-semibold tracking-tight', className)} {...props} />;
}

function CardDescription({ ref, className, ...props }: React.ComponentProps<'p'>) {
  return <p ref={ref} className={cn('text-muted-foreground text-sm', className)} {...props} />;
}

function CardContent({ ref, className, ...props }: React.ComponentProps<'div'>) {
  return <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />;
}

function CardFooter({ ref, className, ...props }: React.ComponentProps<'div'>) {
  return <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
