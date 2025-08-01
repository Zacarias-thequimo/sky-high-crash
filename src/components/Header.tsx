import { memo } from 'react';

interface HeaderProps {
  multiplierHistory: number[];
  balance: number;
}

export const Header = memo(({ multiplierHistory, balance }: HeaderProps) => {
  const getMultiplierColor = (value: number) => {
    if (value >= 1.00 && value <= 2.00) return 'text-multiplier-low';
    if (value >= 3.00 && value <= 9.99) return 'text-multiplier-mid';
    return 'text-multiplier-high';
  };

  const getMultiplierBgColor = (value: number) => {
    if (value >= 1.00 && value <= 2.00) return 'bg-multiplier-low/20';
    if (value >= 3.00 && value <= 9.99) return 'bg-multiplier-mid/20';
    return 'bg-multiplier-high/20';
  };

  return (
    <div className="bg-gray-900/95 border-b border-gray-700 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-red-500">Aviator</h1>
        </div>

        {/* Multiplier History */}
        <div className="flex items-center space-x-1">
          <span className="text-gray-400 text-sm mr-2">Últimas:</span>
          <div className="flex space-x-1 overflow-x-auto">
            {multiplierHistory.slice(-10).map((multiplier, index) => (
              <div
                key={index}
                className={`text-xs font-bold px-2 py-1 rounded-md min-w-[45px] text-center transition-all duration-300 ${
                  getMultiplierColor(multiplier)
                } ${getMultiplierBgColor(multiplier)}`}
              >
                {multiplier.toFixed(2)}x
              </div>
            ))}
          </div>
        </div>

        {/* Balance */}
        <div className="flex items-center space-x-4">
          <div className="text-green-400 font-bold">
            {balance.toFixed(2)} MZN
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
});