import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '~/utils';
import { buttonVariants } from './variants';

export type ButtonProps = React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({ ref, className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? React.Fragment : 'button';
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button };
