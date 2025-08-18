import { useState, useEffect, useRef, memo } from 'react';
import { GameChart } from './GameChart';

interface AviatorGameAreaProps {
  multiplier: number;
  isFlying: boolean;
  isCrashed: boolean;
  onCashOut: () => void;
  canCashOut: boolean;
}

export const AviatorGameArea = memo(({ 
  multiplier, 
  isFlying, 
  isCrashed, 
  onCashOut, 
  canCashOut 
}: AviatorGameAreaProps) => {
  const [showCrashEffect, setShowCrashEffect] = useState(false);
  const [airplanePosition, setAirplanePosition] = useState({ x: 10, y: 85 });
  const chartData = useRef<{ time: number; multiplier: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (isFlying) {
      const now = Date.now();
      
      // Calculate airplane position based on multiplier (moving across screen)
      const baseTime = chartData.current.length;
      const xProgress = Math.min(baseTime * 1.5, 85); // Move across screen
      const yProgress = Math.max(85 - (multiplier - 1) * 10, 5); // Move up based on multiplier
      
      const newPosition = {
        x: 10 + xProgress,
        y: yProgress
      };
      
      setAirplanePosition(newPosition);
      chartData.current.push({ 
        time: now, 
        multiplier: multiplier,
        x: newPosition.x,
        y: newPosition.y
      });
      
      if (chartData.current.length > 50) {
        chartData.current = chartData.current.slice(-50);
      }
    }
  }, [multiplier, isFlying]);

  useEffect(() => {
    if (isCrashed) {
      setShowCrashEffect(true);
      setTimeout(() => setShowCrashEffect(false), 2000);
    }
  }, [isCrashed]);

  useEffect(() => {
    if (!isFlying && !isCrashed) {
      chartData.current = [];
      setAirplanePosition({ x: 10, y: 85 });
    }
  }, [isFlying, isCrashed]);

  return (
    <div className="relative w-full h-48 xs:h-56 sm:h-64 md:h-80 lg:h-96 bg-gray-900/95 border border-gray-700 rounded-lg overflow-hidden mx-auto">
      {/* Game Chart Background */}
      <div className="absolute inset-0">
        <GameChart data={chartData.current} isFlying={isFlying} />
      </div>

      {/* Multiplier Display - Centered */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="text-center">
          <div className={`text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black transition-all duration-300 ${
            isCrashed ? 'text-red-500 animate-pulse' : 
            isFlying ? 'text-green-400' : 'text-gray-400'
          }`}>
            {multiplier.toFixed(2)}x
          </div>
          {isFlying && !isCrashed && (
            <div className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2 animate-pulse">
              Voando...
            </div>
          )}
        </div>
      </div>

      {/* Cash Out Button - removed as per UX request */}
      {/* No overlay cash out button here anymore */}

      {/* Crash Effect */}
      {showCrashEffect && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="text-center">
            <div className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black text-red-500 animate-bounce">
              VOOU!
            </div>
            <div className="text-lg xs:text-xl sm:text-2xl text-red-400 mt-1 sm:mt-2">
              em {multiplier.toFixed(2)}x
            </div>
          </div>
        </div>
      )}

      {/* Waiting for next round */}
      {!isFlying && !isCrashed && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="text-center px-4">
            <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-gray-400 animate-pulse">
              Preparando voo...
            </div>
            <div className="text-sm xs:text-base text-gray-500 mt-1 sm:mt-2">
              O próximo round começará em breve
            </div>
          </div>
        </div>
      )}

      {/* Online Players Count */}
      <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-20">
        <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-800/80 px-2 py-1 sm:px-3 sm:py-1 rounded-full">
          <div className="flex -space-x-1 sm:-space-x-2">
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded-full border-2 border-gray-800"></div>
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-gray-800"></div>
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-blue-500 rounded-full border-2 border-gray-800"></div>
          </div>
          <span className="text-white text-xs sm:text-sm font-medium">3,624</span>
        </div>
      </div>
    </div>
  );
});