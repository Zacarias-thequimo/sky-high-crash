import { useEffect, useState } from 'react';

interface AirplaneProps {
  isFlying: boolean;
  isCrashed: boolean;
}

export const Airplane = ({ isFlying, isCrashed }: AirplaneProps) => {
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
          viewBox="0 0 48 48" 
          fill="currentColor"
        >
          <path d="M24 2L22 4v6l-8 4v4l8-2v6l-4 2v2l4-1 4 1v-2l-4-2v-6l8 2v-4l-8-4V4z" />
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
};