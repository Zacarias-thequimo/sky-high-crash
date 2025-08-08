import { memo } from 'react';

interface MultiplierDisplayProps {
  multiplier: number;
  isFlying: boolean;
  isCrashed: boolean;
}

export const MultiplierDisplay = memo(({ 
  multiplier, 
  isFlying, 
  isCrashed 
}: MultiplierDisplayProps) => {
  const getMultiplierColor = (value: number) => {
    if (value >= 1.00 && value <= 2.00) return 'multiplier-low';
    if (value >= 3.00 && value <= 9.99) return 'multiplier-mid';
    return 'multiplier-high';
  };

  const getDisplayClass = () => {
    let baseClass = 'multiplier-display transition-all duration-500 pulse-glow';
    
    if (isCrashed) {
      return `${baseClass} crash-effect`;
    }
    
    if (isFlying) {
      return `${baseClass} glow-primary`;
    }
    
    return `${baseClass} opacity-60`;
  };

  return (
    <div className="text-center">
      <div className={getDisplayClass()}>
        {multiplier.toFixed(2)}x
      </div>
      
      {isFlying && (
        <div className="text-lg text-digital mt-4 animate-pulse glow-primary" style={{ color: 'hsl(var(--success))' }}>
          VOANDO...
        </div>
      )}
      
      {isCrashed && (
        <div className="text-xl text-digital mt-4 glow-action" style={{ color: 'hsl(var(--action))' }}>
          VOOU!
        </div>
      )}
    </div>
  );
});