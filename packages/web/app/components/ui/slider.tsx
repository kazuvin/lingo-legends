import * as React from 'react';
import { cn } from '~/utils/cn';

interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: number[];
  max: number;
  min?: number;
  step?: number;
  onValueChange: (values: number[]) => void;
  disabled?: boolean;
}

export function Slider({
  value,
  max,
  min = 0,
  step = 1,
  onValueChange,
  disabled = false,
  className,
  ...props
}: SliderProps) {
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      
      setIsDragging(true);
      const rect = sliderRef.current?.getBoundingClientRect();
      if (rect) {
        const percentage = (e.clientX - rect.left) / rect.width;
        const newValue = Math.max(min, Math.min(max, percentage * (max - min) + min));
        const steppedValue = Math.round(newValue / step) * step;
        onValueChange([steppedValue]);
      }
    },
    [disabled, max, min, step, onValueChange]
  );

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isDragging || disabled) return;
      
      const rect = sliderRef.current?.getBoundingClientRect();
      if (rect) {
        const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const newValue = percentage * (max - min) + min;
        const steppedValue = Math.round(newValue / step) * step;
        onValueChange([Math.max(min, Math.min(max, steppedValue))]);
      }
    },
    [isDragging, disabled, max, min, step, onValueChange]
  );

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const percentage = ((value[0] - min) / (max - min)) * 100;

  return (
    <div
      ref={sliderRef}
      className={cn(
        'relative flex w-full touch-none select-none items-center cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onMouseDown={handleMouseDown}
      {...props}
    >
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <div 
          className="absolute h-full bg-primary transition-all duration-150"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div
        className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        style={{ 
          position: 'absolute',
          left: `calc(${percentage}% - 10px)`
        }}
      />
    </div>
  );
}