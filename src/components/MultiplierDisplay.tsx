interface MultiplierDisplayProps {
  multiplier: number;
  isFlying: boolean;
  isCrashed: boolean;
}

export const MultiplierDisplay = ({ 
  multiplier, 
  isFlying, 
  isCrashed 
}: MultiplierDisplayProps) => {
  const getMultiplierColor = (value: number) => {
    if (value < 2) return 'multiplier-low';
    if (value < 10) return 'multiplier-mid';
    return 'multiplier-high';
  };

  const getDisplayClass = () => {
    let baseClass = 'multiplier-display transition-all duration-300';
    
    if (isCrashed) {
      return `${baseClass} text-crash animate-crash-shake`;
    }
    
    if (isFlying) {
      return `${baseClass} text-${getMultiplierColor(multiplier)} glow-neon`;
    }
    
    return `${baseClass} text-muted-foreground`;
  };

  return (
    <div className="text-center">
      <div className={getDisplayClass()}>
        {multiplier.toFixed(2)}x
      </div>
      
      {isFlying && (
        <div className="text-sm text-muted-foreground mt-2 animate-pulse">
          Voando...
        </div>
      )}
      
      {isCrashed && (
        <div className="text-sm text-crash/80 mt-2">
          Crashed!
        </div>
      )}
    </div>
  );
};