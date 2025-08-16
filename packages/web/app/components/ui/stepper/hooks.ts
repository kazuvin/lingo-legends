import * as React from 'react';

export type StepState = 'completed' | 'active' | 'inactive' | 'disabled';
export type Orientation = 'vertical' | 'horizontal';

export interface StepperContextValue {
  currentStep: number;
  orientation: Orientation;
  steps: number[];
}

export interface StepperItemContextValue {
  state: StepState;
  step: number;
  isLast: boolean;
}

export const StepperContext = React.createContext<StepperContextValue | null>(null);
export const StepperItemContext = React.createContext<StepperItemContextValue | null>(null);

export function useStepper() {
  const context = React.useContext(StepperContext);
  if (!context) {
    throw new Error('useStepper must be used within a Stepper component');
  }
  return context;
}

export function useStepperItem() {
  const context = React.useContext(StepperItemContext);
  if (!context) {
    throw new Error('useStepperItem must be used within a StepperItem component');
  }
  return context;
}

