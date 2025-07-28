import { memo, useMemo } from 'react';

interface MultiplierHistoryProps {
  history: number[];
}

export const MultiplierHistory = memo(({ history }: MultiplierHistoryProps) => {
  const getMultiplierColor = (multiplier: number) => {
    if (multiplier < 2) return 'bg-multiplier-low text-primary-foreground';
    if (multiplier < 10) return 'bg-multiplier-mid text-primary-foreground';
    return 'bg-multiplier-high text-primary-foreground';
  };

  const getMultiplierLabel = (multiplier: number) => {
    if (multiplier < 2) return 'Baixo';
    if (multiplier < 10) return 'Médio';
    return 'Alto';
  };

  // Memoize calculations for better performance
  const historyStats = useMemo(() => {
    const lowCount = history.filter(m => m < 2).length;
    const midCount = history.filter(m => m >= 2 && m < 10).length;
    const highCount = history.filter(m => m >= 10).length;
    const displayHistory = history.slice(-20).reverse();
    
    return { lowCount, midCount, highCount, displayHistory };
  }, [history]);

  return (
    <div className="card-game">
      <h3 className="text-lg font-bold text-foreground mb-4 text-center">
        Histórico de Multiplicadores
      </h3>
      
      {history.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          Nenhum histórico ainda
        </div>
      ) : (
        <div className="space-y-3">
          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 text-xs text-center mb-4">
            <div className="flex items-center justify-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-multiplier-low"></div>
              <span>1.00x - 1.99x</span>
            </div>
            <div className="flex items-center justify-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-multiplier-mid"></div>
              <span>2.00x - 9.99x</span>
            </div>
            <div className="flex items-center justify-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-multiplier-high"></div>
              <span>10.00x+</span>
            </div>
          </div>

          {/* History Grid */}
          <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
            {historyStats.displayHistory.map((multiplier, index) => (
              <div
                key={index}
                className={`
                  relative rounded-lg p-3 text-center font-bold text-sm
                  transition-all duration-300 hover:scale-105 cursor-pointer
                  ${getMultiplierColor(multiplier)}
                  glow-primary
                `}
                title={`${getMultiplierLabel(multiplier)} - ${multiplier.toFixed(2)}x`}
              >
                <div className="text-lg font-black">
                  {multiplier.toFixed(2)}x
                </div>
                <div className="text-xs opacity-80">
                  {getMultiplierLabel(multiplier)}
                </div>
              </div>
            ))}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-multiplier-low">
                {historyStats.lowCount}
              </div>
              <div className="text-xs text-muted-foreground">Baixos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-multiplier-mid">
                {historyStats.midCount}
              </div>
              <div className="text-xs text-muted-foreground">Médios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-multiplier-high">
                {historyStats.highCount}
              </div>
              <div className="text-xs text-muted-foreground">Altos</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});