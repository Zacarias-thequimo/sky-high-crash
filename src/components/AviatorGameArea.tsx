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
    <div className="relative w-full h-96 card-glass overflow-hidden">
      {/* Diagonal Light Streaks */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-success/5 rotate-12 scale-150"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-success/5 via-transparent to-transparent"></div>
      </div>

      {/* Game Chart Background */}
      <div className="absolute inset-0">
        <GameChart data={chartData.current} isFlying={isFlying} />
      </div>

      {/* Airplane */}
      <div 
        className="absolute transition-all duration-150 ease-out z-10"
        style={{
          left: `${airplanePosition.x}%`,
          top: `${airplanePosition.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className={`text-3xl transition-all duration-300 ${
          isCrashed ? 'animate-ping text-red-500' : 'text-blue-400'
        }`} style={{ transform: isFlying ? 'rotate(15deg)' : 'rotate(0deg)' }}>
          ✈️
        </div>
      </div>

      {/* Ultra-Modern Multiplier Display */}
      <div className="absolute top-8 left-8 z-20">
        <div className={`multiplier-display transition-all duration-500 ${
          isCrashed ? 'crashed crash-effect' : 
          isFlying ? 'pulse-glow' : 'opacity-60'
        }`}>
          {multiplier.toFixed(2)}x
        </div>
        {isFlying && !isCrashed && (
          <div className="text-lg text-digital text-neon mt-4 animate-pulse" style={{ color: 'hsl(var(--success))' }}>
            VOANDO...
          </div>
        )}
        {isCrashed && (
          <div className="text-xl text-digital text-neon mt-4" style={{ color: 'hsl(var(--action))' }}>
            CRASHED!
          </div>
        )}
      </div>

      {/* Futuristic Cash Out Button */}
      {isFlying && canCashOut && (
        <div className="absolute top-8 right-8 z-20">
          <button 
            onClick={onCashOut}
            className="btn-cashout text-neon"
          >
            SACAR {multiplier.toFixed(2)}x
          </button>
        </div>
      )}

      {/* Crash Effect */}
      {showCrashEffect && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="text-center">
            <div className="text-6xl font-black text-red-500 animate-bounce">
              VOOU!
            </div>
            <div className="text-2xl text-red-400 mt-2">
              em {multiplier.toFixed(2)}x
            </div>
          </div>
        </div>
      )}

      {/* Waiting for next round */}
      {!isFlying && !isCrashed && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-400 animate-pulse">
              Preparando voo...
            </div>
            <div className="text-gray-500 mt-2">
              O próximo round começará em breve
            </div>
          </div>
        </div>
      )}

      {/* Glassmorphism Players Count */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="flex items-center space-x-2 card-glass px-4 py-2 border border-success/20">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-action to-crash rounded-full border-2 border-background shadow-sm shadow-action/50"></div>
            <div className="w-6 h-6 bg-gradient-to-br from-success to-success-glow rounded-full border-2 border-background shadow-sm shadow-success/50"></div>
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary-glow rounded-full border-2 border-background shadow-sm shadow-primary/50"></div>
          </div>
          <span className="text-foreground text-sm font-medium text-digital">3,624</span>
        </div>
      </div>
    </div>
  );
});