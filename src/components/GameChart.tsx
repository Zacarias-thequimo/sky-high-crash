import { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface GameChartProps {
  data: { time: number; multiplier: number }[];
  isFlying: boolean;
}

export const GameChart = memo(({ data, isFlying }: GameChartProps) => {
  // Optimize data processing - only keep last 50 points for performance
  const optimizedData = data.slice(-50).map((point, index) => ({
    index,
    multiplier: point.multiplier
  }));

  if (optimizedData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center opacity-50">
        <div className="text-muted-foreground">Aguardando próximo voo...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={optimizedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <XAxis 
            dataKey="index" 
            hide
          />
          <YAxis 
            domain={[1, 'dataMax']}
            hide
          />
          <Line
            type="monotone"
            dataKey="multiplier"
            stroke="hsl(var(--primary))"
            strokeWidth={4}
            dot={false}
            animationDuration={0}
            className="drop-shadow-lg"
            style={{
              filter: isFlying ? 'drop-shadow(0 0 12px hsl(var(--primary) / 0.6))' : 'none'
            }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Grid overlay for better visual */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full" style={{
          background: `
            linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px),
            linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
      </div>
    </div>
  );
});