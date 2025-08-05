import { memo, useEffect, useState } from 'react';

interface MultiplierReelProps {
  multiplierHistory: number[];
}

export const MultiplierReel = memo(({ multiplierHistory }: MultiplierReelProps) => {
  const [animatingMultipliers, setAnimatingMultipliers] = useState<number[]>([]);

  useEffect(() => {
    setAnimatingMultipliers(multiplierHistory.slice(-15));
  }, [multiplierHistory]);

  const getMultiplierStyle = (value: number) => {
    if (value >= 1.00 && value <= 2.99) {
      return 'text-blue-400 bg-blue-500/20 border border-blue-500/30';
    }
    if (value >= 3.00 && value <= 9.99) {
      return 'text-purple-400 bg-purple-500/20 border border-purple-500/30';
    }
    return 'text-pink-400 bg-pink-500/20 border border-pink-500/30';
  };

  const getMultiplierSize = (value: number) => {
    if (value >= 10.00) return 'text-xl px-4 py-2';
    if (value >= 5.00) return 'text-lg px-3 py-2';
    return 'text-base px-3 py-1';
  };

  return (
    <div className="bg-background/50 border border-border rounded-lg p-4 overflow-hidden">
      <div className="flex items-center space-x-2">
        <span className="text-muted-foreground text-sm font-medium">Últimos multiplicadores:</span>
        <div className="flex-1 overflow-hidden">
          <div className="flex space-x-2 animate-scroll">
            {animatingMultipliers.map((multiplier, index) => (
              <div
                key={`${multiplier}-${index}`}
                className={`
                  flex-shrink-0 rounded-md font-bold text-center transition-all duration-300
                  ${getMultiplierStyle(multiplier)}
                  ${getMultiplierSize(multiplier)}
                  animate-bounce
                `}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationDuration: '1s',
                  animationIterationCount: '1'
                }}
              >
                {multiplier.toFixed(2)}x
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});