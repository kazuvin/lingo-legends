import * as React from 'react';
import { cn } from '~/utils';
import {
  useStepper,
  useStepperItem,
  StepperContext,
  StepperItemContext,
  type StepState,
  type Orientation,
  type StepperContextValue,
  type StepperItemContextValue,
} from './hooks';

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep?: number;
  orientation?: Orientation;
}

export interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number;
  disabled?: boolean;
}

export type StepperTriggerProps = React.HTMLAttributes<HTMLDivElement>;

export type StepperTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export type StepperDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export type StepperSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

// Main Stepper component
function Stepper({ currentStep = 1, orientation = 'vertical', className, children, ...props }: StepperProps) {
  // Extract step numbers from children
  const steps = React.useMemo(() => {
    const stepNumbers: number[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && typeof child.type === 'function' && child.type === StepperItem) {
        const stepProp = (child.props as StepperItemProps).step;
        if (typeof stepProp === 'number') {
          stepNumbers.push(stepProp);
        }
      }
    });
    return stepNumbers.sort((a, b) => a - b);
  }, [children]);

  const contextValue: StepperContextValue = {
    currentStep,
    orientation,
    steps,
  };

  return (
    <StepperContext.Provider value={contextValue}>
      <div
        className={cn(
          'stepper',
          orientation === 'vertical' && 'flex flex-col',
          orientation === 'horizontal' && 'flex flex-row items-center',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
}

// StepperItem component
function StepperItem({ step, disabled = false, children, className, ...props }: StepperItemProps) {
  const { currentStep, steps, orientation } = useStepper();

  const state: StepState = React.useMemo(() => {
    if (disabled) return 'disabled';
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'active';
    return 'inactive';
  }, [step, currentStep, disabled]);

  const isLast = React.useMemo(() => {
    const sortedSteps = [...steps].sort((a, b) => a - b);
    return step === sortedSteps[sortedSteps.length - 1];
  }, [step, steps]);

  const contextValue: StepperItemContextValue = {
    state,
    step,
    isLast,
  };

  return (
    <StepperItemContext.Provider value={contextValue}>
      <div className={cn('stepper-item group relative', className)} data-state={state} {...props}>
        {/* Automatic connector line for vertical orientation */}
        {orientation === 'vertical' && !isLast && (
          <div
            className={cn(
              'bg-border absolute top-[36px] left-[18px] z-0 h-[calc(100%+1.5rem)] w-0.5 rounded-full transition-colors',
              state === 'completed' && 'bg-primary',
            )}
            aria-hidden="true"
          />
        )}

        {children}
      </div>
    </StepperItemContext.Provider>
  );
}

// StepperTrigger component
function StepperTrigger({ className, children, ...props }: StepperTriggerProps) {
  const { state } = useStepperItem();

  return (
    <div
      className={cn(
        'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
        'data-[state=completed]:bg-primary data-[state=completed]:border-primary data-[state=completed]:text-primary-foreground data-[state=completed]:hover:bg-primary/90',
        'data-[state=active]:bg-primary data-[state=active]:border-primary data-[state=active]:text-primary-foreground data-[state=active]:hover:bg-primary/90',
        'data-[state=inactive]:bg-background data-[state=inactive]:border-border data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:border-ring',
        'data-[state=disabled]:bg-background data-[state=disabled]:border-border data-[state=disabled]:text-muted-foreground data-[state=disabled]:cursor-default',
        className,
      )}
      data-state={state}
      {...props}
    >
      {children}
    </div>
  );
}

// StepperTitle component
function StepperTitle({ className, ...props }: StepperTitleProps) {
  const { state } = useStepperItem();

  return (
    <h3
      className={cn(
        'text-sm font-semibold transition-colors',
        'data-[state=active]:text-primary',
        'data-[state=completed]:text-foreground',
        'data-[state=inactive]:text-muted-foreground',
        'data-[state=disabled]:text-muted-foreground data-[state=disabled]:opacity-50',
        className,
      )}
      data-state={state}
      {...props}
    />
  );
}

// StepperDescription component
function StepperDescription({ className, ...props }: StepperDescriptionProps) {
  const { state } = useStepperItem();

  return (
    <p
      className={cn(
        'text-xs transition-colors',
        'data-[state=active]:text-primary',
        'data-[state=completed]:text-muted-foreground',
        'data-[state=inactive]:text-muted-foreground',
        'data-[state=disabled]:text-muted-foreground data-[state=disabled]:opacity-50',
        className,
      )}
      data-state={state}
      {...props}
    />
  );
}

// StepperSeparator component
function StepperSeparator({ className, ...props }: StepperSeparatorProps) {
  const { orientation } = useStepper();
  const { state } = useStepperItem();

  return (
    <div
      className={cn(
        'stepper-separator',
        orientation === 'vertical' && 'h-full w-0.5',
        orientation === 'horizontal' && 'h-0.5 w-full',
        className,
      )}
      data-state={state}
      data-orientation={orientation}
      {...props}
    />
  );
}

export { Stepper, StepperItem, StepperTrigger, StepperTitle, StepperDescription, StepperSeparator };
