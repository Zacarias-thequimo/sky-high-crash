import { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface GameChartProps {
  data: { time: number; multiplier: number; x: number; y: number }[];
  isFlying: boolean;
}

export const GameChart = memo(({ data, isFlying }: GameChartProps) => {
  if (data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center opacity-50">
        <div className="text-gray-400">Aguardando próximo voo...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Custom SVG line that follows airplane */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2"/>
            <stop offset="50%" stopColor="rgb(59, 130, 246)" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="1"/>
          </linearGradient>
        </defs>
        
        {data.length > 1 && (
          <path
            d={`M ${data.map((point, i) => `${point.x}% ${point.y}%`).join(' L ')}`}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            className="drop-shadow-lg"
            style={{
              filter: isFlying ? 'drop-shadow(0 0 8px rgb(59, 130, 246))' : 'none'
            }}
          />
        )}
        
        {/* Trail dots */}
        {data.slice(-10).map((point, index) => (
          <circle
            key={index}
            cx={`${point.x}%`}
            cy={`${point.y}%`}
            r="2"
            fill="rgb(59, 130, 246)"
            opacity={0.3 + (index * 0.07)}
          />
        ))}
      </svg>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="w-full h-full" style={{
          background: `
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '8% 10%'
        }} />
      </div>
    </div>
  );
});