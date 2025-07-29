import { memo } from 'react';

interface HeaderProps {
  multiplierHistory: number[];
  balance: number;
}

export const Header = memo(({ multiplierHistory, balance }: HeaderProps) => {
  const getMultiplierColor = (value: number) => {
    if (value < 2) return 'text-blue-400';
    if (value < 5) return 'text-green-400';
    if (value < 10) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-900/95 border-b border-gray-700 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-red-500">Aviator</h1>
        </div>

        {/* Multiplier History */}
        <div className="flex items-center space-x-2 overflow-x-auto">
          {multiplierHistory.slice(-15).map((multiplier, index) => (
            <div
              key={index}
              className={`text-sm font-semibold px-2 py-1 rounded ${getMultiplierColor(multiplier)}`}
            >
              {multiplier.toFixed(2)}x
            </div>
          ))}
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