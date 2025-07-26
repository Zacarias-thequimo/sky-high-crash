import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface GameChartProps {
  data: { time: number; multiplier: number }[];
  isFlying: boolean;
}

export const GameChart = ({ data, isFlying }: GameChartProps) => {
  // Format data for chart
  const chartData = data.map((point, index) => ({
    index,
    multiplier: point.multiplier
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center opacity-50">
        <div className="text-muted-foreground">Aguardando próximo voo...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
            strokeWidth={3}
            dot={false}
            animationDuration={0}
            className="drop-shadow-lg"
            style={{
              filter: isFlying ? 'drop-shadow(0 0 8px hsl(var(--primary) / 0.5))' : 'none'
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};