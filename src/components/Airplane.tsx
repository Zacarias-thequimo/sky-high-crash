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
      {/* Futuristic Fighter Airplane */}
      <div 
        className={`
          w-12 h-12 transition-all duration-300 airplane-container
          ${isFlying ? 'airplane-flying-glow' : 'airplane-idle'}
          ${isCrashed ? 'airplane-crashed' : ''}
        `}
      >
        <svg 
          width="48" 
          height="48" 
          viewBox="0 0 100 100" 
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
        >
          <defs>
            {/* Gradients for metallic effect */}
            <linearGradient id="fuselageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E8E8E8" />
              <stop offset="30%" stopColor="#C0C0C0" />
              <stop offset="70%" stopColor="#A8A8A8" />
              <stop offset="100%" stopColor="#808080" />
            </linearGradient>
            
            <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4D4D4" />
              <stop offset="50%" stopColor="#B8B8B8" />
              <stop offset="100%" stopColor="#9C9C9C" />
            </linearGradient>
            
            <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#FFA500" />
              <stop offset="100%" stopColor="#FF8C00" />
            </linearGradient>
          </defs>
          
          {/* Main fuselage (aerodynamic body) */}
          <path 
            d="M50 15 Q52 18 52 25 Q52 45 50 50 Q48 45 48 25 Q48 18 50 15 Z" 
            fill="url(#fuselageGradient)" 
            stroke="#2C2C2C" 
            strokeWidth="0.5"
          />
          
          {/* Nose cone (sharp, pointed) */}
          <path 
            d="M50 15 Q53 12 50 8 Q47 12 50 15 Z" 
            fill="url(#goldAccent)"
            stroke="#1A1A1A" 
            strokeWidth="0.3"
          />
          
          {/* Main delta wings */}
          <path 
            d="M20 35 Q35 32 50 35 Q65 32 80 35 Q75 42 50 45 Q25 42 20 35 Z" 
            fill="url(#wingGradient)"
            stroke="#2C2C2C" 
            strokeWidth="0.5"
          />
          
          {/* Wing golden highlights */}
          <path 
            d="M25 36 Q40 34 50 36 Q60 34 75 36 Q70 38 50 39 Q30 38 25 36 Z" 
            fill="url(#goldAccent)"
            opacity="0.8"
          />
          
          {/* Tail fins */}
          <path 
            d="M45 60 Q50 58 55 60 Q53 68 50 70 Q47 68 45 60 Z" 
            fill="url(#wingGradient)"
            stroke="#2C2C2C" 
            strokeWidth="0.3"
          />
          
          {/* Engine intakes (black matte details) */}
          <ellipse cx="42" cy="45" rx="2" ry="3" fill="#1A1A1A" />
          <ellipse cx="58" cy="45" rx="2" ry="3" fill="#1A1A1A" />
          
          {/* Cockpit canopy */}
          <path 
            d="M48 20 Q50 18 52 20 Q52 28 50 30 Q48 28 48 20 Z" 
            fill="#4A90E2" 
            opacity="0.7"
            stroke="#2C2C2C" 
            strokeWidth="0.3"
          />
          
          {/* Wing tip missiles/details */}
          <circle cx="20" cy="35" r="1.5" fill="#1A1A1A" />
          <circle cx="80" cy="35" r="1.5" fill="#1A1A1A" />
        </svg>
      </div>

      {/* Enhanced Golden Trail Effect */}
      {isFlying && (
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-2">
          <div className="flex items-center space-x-0.5">
            {/* Main trail particles */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="golden-trail-particle"
                style={{
                  width: `${4 - i * 0.4}px`,
                  height: `${4 - i * 0.4}px`,
                  opacity: (100 - i * 12) / 100,
                  animationDelay: `${i * 0.05}s`,
                  background: `linear-gradient(135deg, #FFD700, #FFA500)`,
                  boxShadow: `0 0 ${6 - i}px #FFD700`,
                  borderRadius: '50%',
                }}
              />
            ))}
            
            {/* Secondary lighter trail */}
            {[...Array(6)].map((_, i) => (
              <div
                key={`light-${i}`}
                className="animate-pulse"
                style={{
                  width: `${2 - i * 0.2}px`,
                  height: `${2 - i * 0.2}px`,
                  opacity: (80 - i * 15) / 100,
                  animationDelay: `${i * 0.08}s`,
                  background: `radial-gradient(circle, #FFFF99, transparent)`,
                  borderRadius: '50%',
                  position: 'absolute',
                  left: `${i * 4}px`,
                  top: `${Math.sin(i * 0.5) * 2}px`,
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