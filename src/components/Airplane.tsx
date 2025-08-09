import { useEffect, useState, memo } from 'react';

interface AirplaneProps {
  isFlying: boolean;
  isCrashed: boolean;
}

export const Airplane = memo(({ isFlying, isCrashed }: AirplaneProps) => {
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (isFlying) {
      setAnimationClass('airplane-flying');
    } else if (isCrashed) {
      setAnimationClass('crash-effect');
    } else {
      setAnimationClass('animate-float');
    }
  }, [isFlying, isCrashed]);

  return (
    <div className={`relative ${animationClass}`}>
      {/* Airplane Icon */}
      <div 
        className={`
          w-12 h-12 transition-all duration-300 
          ${isFlying ? 'text-primary glow-neon' : 'text-muted-foreground'}
          ${isCrashed ? 'text-crash' : ''}
        `}
      >
        <svg 
          width="48" 
          height="48" 
          viewBox="0 0 100 100" 
          fill="currentColor"
        >
          {/* Airplane body */}
          <ellipse cx="50" cy="50" rx="8" ry="25" fill="currentColor" />
          
          {/* Main wings */}
          <ellipse cx="50" cy="40" rx="35" ry="8" fill="currentColor" />
          
          {/* Tail wings */}
          <ellipse cx="50" cy="70" rx="15" ry="5" fill="currentColor" />
          
          {/* Nose */}
          <circle cx="50" cy="25" r="6" fill="currentColor" />
          
          {/* Wing tips */}
          <circle cx="15" cy="40" r="3" fill="currentColor" />
          <circle cx="85" cy="40" r="3" fill="currentColor" />
        </svg>
      </div>

      {/* Trail Effect */}
      {isFlying && (
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-1 rounded-full bg-primary animate-pulse"
                style={{
                  opacity: (100 - i * 20) / 100,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Explosion Effect */}
      {isCrashed && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-crash text-2xl animate-ping">💥</div>
        </div>
      )}
    </div>
  );
});