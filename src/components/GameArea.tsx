import { useState, useEffect, useRef } from 'react';
import { Airplane } from './Airplane';
import { MultiplierDisplay } from './MultiplierDisplay';
import { GameChart } from './GameChart';

interface GameAreaProps {
  multiplier: number;
  isFlying: boolean;
  isCrashed: boolean;
  onCashOut: () => void;
  canCashOut: boolean;
}

export const GameArea = ({ 
  multiplier, 
  isFlying, 
  isCrashed, 
  onCashOut, 
  canCashOut 
}: GameAreaProps) => {
  const [showCrashEffect, setShowCrashEffect] = useState(false);
  const chartData = useRef<{ time: number; multiplier: number }[]>([]);

  useEffect(() => {
    if (isFlying) {
      chartData.current.push({ 
        time: Date.now(), 
        multiplier: multiplier 
      });
    }
  }, [multiplier, isFlying]);

  useEffect(() => {
    if (isCrashed) {
      setShowCrashEffect(true);
      setTimeout(() => setShowCrashEffect(false), 1500);
    }
  }, [isCrashed]);

  useEffect(() => {
    if (!isFlying && !isCrashed) {
      chartData.current = [];
    }
  }, [isFlying, isCrashed]);

  return (
    <div className="relative w-full h-96 card-game overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 grid-rows-8 h-full w-full">
          {Array.from({ length: 96 }).map((_, i) => (
            <div key={i} className="border-r border-b border-primary/20" />
          ))}
        </div>
      </div>

      {/* Game Chart */}
      <div className="absolute inset-4">
        <GameChart data={chartData.current} isFlying={isFlying} />
      </div>

      {/* Airplane */}
      <div className="absolute top-1/2 left-16">
        <Airplane isFlying={isFlying} isCrashed={isCrashed} />
      </div>

      {/* Multiplier Display */}
      <div className="absolute top-8 left-8">
        <MultiplierDisplay 
          multiplier={multiplier} 
          isFlying={isFlying}
          isCrashed={isCrashed}
        />
      </div>

      {/* Cash Out Button */}
      {isFlying && canCashOut && (
        <div className="absolute top-8 right-8">
          <button 
            onClick={onCashOut}
            className="btn-cashout animate-pulse-glow"
          >
            SACAR {multiplier.toFixed(2)}x
          </button>
        </div>
      )}

      {/* Crash Effect */}
      {showCrashEffect && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="crash-effect">
            <div className="text-6xl font-black text-crash">
              CRASHED!
            </div>
            <div className="text-2xl text-crash/80 mt-2">
              at {multiplier.toFixed(2)}x
            </div>
          </div>
        </div>
      )}

      {/* Waiting for next round */}
      {!isFlying && !isCrashed && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-waiting animate-pulse">
              Preparando voo...
            </div>
            <div className="text-muted-foreground mt-2">
              O próximo round começará em breve
            </div>
          </div>
        </div>
      )}
    </div>
  );
};