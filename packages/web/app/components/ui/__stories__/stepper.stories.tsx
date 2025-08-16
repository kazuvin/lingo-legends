import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperTitle,
  StepperDescription,
  StepperSeparator,
} from '../stepper';

const meta: Meta<typeof Stepper> = {
  title: 'UI/Stepper',
  component: Stepper,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    currentStep: {
      control: { type: 'number', min: 1, max: 5 },
    },
    orientation: {
      control: { type: 'select' },
      options: ['vertical', 'horizontal'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Stepper>;

const steps = [
  {
    step: 1,
    title: "Your details",
    description: "Provide your name and email address. We will use this information to create your account",
  },
  {
    step: 2,
    title: "Company details",
    description: "A few details about your company will help us personalize your experience",
  },
  {
    step: 3,
    title: "Invite your team",
    description: "Start collaborating with your team by inviting them to join your account. You can skip this step and invite them later",
  },
];

export const Default: Story = {
  args: {
    currentStep: 2,
    orientation: 'vertical',
  },
  render: (args) => (
    <div className="w-full max-w-md">
      <Stepper {...args} className="flex w-full flex-col justify-start gap-6">
        {steps.map((step) => (
          <StepperItem
            key={step.step}
            step={step.step}
            className="flex w-full items-start gap-4 pb-6 last:pb-0"
          >
            <StepperTrigger className="z-10 shrink-0">
              {step.step}
            </StepperTrigger>

            <div className="flex flex-col gap-1">
              <StepperTitle>
                {step.title}
              </StepperTitle>
              <StepperDescription>
                {step.description}
              </StepperDescription>
            </div>
          </StepperItem>
        ))}
      </Stepper>
    </div>
  ),
};

export const Horizontal: Story = {
  args: {
    currentStep: 2,
    orientation: 'horizontal',
  },
  render: (args) => (
    <div className="w-full max-w-4xl">
      <Stepper {...args} className="flex w-full items-start justify-between">
        {steps.map((step, index) => (
          <StepperItem
            key={step.step}
            step={step.step}
            className="relative flex flex-col items-center gap-3 flex-1"
          >
            {/* Manual separator for horizontal layout */}
            {index !== steps.length - 1 && (
              <div 
                className="absolute left-[calc(50%+20px)] top-[20px] h-0.5 w-[calc(100%-40px)] bg-border z-0"
                aria-hidden="true"
              />
            )}

            <StepperTrigger className="z-10 shrink-0">
              {step.step}
            </StepperTrigger>

            <div className="flex flex-col items-center gap-1 text-center max-w-[140px]">
              <StepperTitle>
                {step.title}
              </StepperTitle>
              <StepperDescription>
                {step.description}
              </StepperDescription>
            </div>
          </StepperItem>
        ))}
      </Stepper>
    </div>
  ),
};

export const Simple: Story = {
  args: {
    currentStep: 1,
    orientation: 'vertical',
  },
  render: (args) => (
    <div className="w-full max-w-sm">
      <Stepper {...args} className="flex w-full flex-col justify-start gap-4">
        {[1, 2, 3, 4].map((stepNumber) => (
          <StepperItem
            key={stepNumber}
            step={stepNumber}
            className="flex w-full items-center gap-3 pb-4 last:pb-0"
          >
            <StepperTrigger className="z-10 shrink-0">
              {stepNumber}
            </StepperTrigger>

            <StepperTitle>
              Step {stepNumber}
            </StepperTitle>
          </StepperItem>
        ))}
      </Stepper>
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    currentStep: 1,
    orientation: 'vertical',
  },
  render: function InteractiveStepper(args) {
    const [currentStep, setCurrentStep] = React.useState(args.currentStep || 1);
    
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="flex gap-2">
          <Button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            size="sm"
            variant="outline"
          >
            Previous
          </Button>
          <Button
            onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
            disabled={currentStep === steps.length}
            size="sm"
          >
            Next
          </Button>
        </div>
        
        <Stepper {...args} currentStep={currentStep} className="flex w-full flex-col justify-start gap-6">
          {steps.map((step) => (
            <StepperItem
              key={step.step}
              step={step.step}
              className="flex w-full items-start gap-4 pb-6 last:pb-0"
            >
              <StepperTrigger 
                className="z-10 shrink-0" 
                onClick={() => setCurrentStep(step.step)}
              >
                {step.step}
              </StepperTrigger>

              <div className="flex flex-col gap-1">
                <StepperTitle>
                  {step.title}
                </StepperTitle>
                <StepperDescription>
                  {step.description}
                </StepperDescription>
              </div>
            </StepperItem>
          ))}
        </Stepper>
      </div>
    );
  },
};

export const StepByStep: Story = {
  args: {
    currentStep: 1,
    orientation: 'vertical',
  },
  render: function StepByStepStepper(args) {
    const [currentStep, setCurrentStep] = React.useState(args.currentStep || 1);
    const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());
    
    const handleNext = () => {
      if (currentStep <= steps.length) {
        setCompletedSteps(prev => new Set(prev).add(currentStep));
        setCurrentStep(prev => Math.min(steps.length, prev + 1));
      }
    };
    
    const handleStepClick = (stepNumber: number) => {
      // Only allow navigation to completed steps or current step
      if (completedSteps.has(stepNumber) || stepNumber <= currentStep) {
        setCurrentStep(stepNumber);
      }
    };
    
    const isStepDisabled = (stepNumber: number) => {
      return stepNumber > currentStep && !completedSteps.has(stepNumber);
    };
    
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="flex gap-2">
          <Button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            size="sm"
            variant="outline"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentStep > steps.length}
            size="sm"
          >
            {currentStep <= steps.length ? 'Complete Step' : 'Finished'}
          </Button>
        </div>
        
        <Stepper {...args} currentStep={currentStep} className="flex w-full flex-col justify-start gap-6">
          {steps.map((step) => (
            <StepperItem
              key={step.step}
              step={step.step}
              disabled={isStepDisabled(step.step)}
              className="flex w-full items-start gap-4 pb-6 last:pb-0"
            >
              <StepperTrigger 
                className="z-10 shrink-0" 
                onClick={() => handleStepClick(step.step)}
              >
                {completedSteps.has(step.step) ? '✓' : step.step}
              </StepperTrigger>

              <div className="flex flex-col gap-1">
                <StepperTitle>
                  {step.title}
                </StepperTitle>
                <StepperDescription>
                  {step.description}
                </StepperDescription>
              </div>
            </StepperItem>
          ))}
        </Stepper>
      </div>
    );
  },
};