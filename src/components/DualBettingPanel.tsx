import { useState, memo, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface DualBettingPanelProps {
  balance: number;
  onPlaceBet: (amount: number, panel: 1 | 2) => void;
  onCashOut: (panel: 1 | 2) => void;
  isFlying: boolean;
  currentMultiplier: number;
  bets: {
    panel1: { amount: number; isPlaced: boolean; canCashOut: boolean };
    panel2: { amount: number; isPlaced: boolean; canCashOut: boolean };
  };
}

export const DualBettingPanel = memo(({
  balance,
  onPlaceBet,
  onCashOut,
  isFlying,
  currentMultiplier,
  bets
}: DualBettingPanelProps) => {
  const [betAmount1, setBetAmount1] = useState(1.00);
  const [betAmount2, setBetAmount2] = useState(8.00);
  const [autoMode1, setAutoMode1] = useState(false);
  const [autoMode2, setAutoMode2] = useState(false);

  const [isProcessingCashOut, setIsProcessingCashOut] = useState(false);
  const quickAmounts = [32, 80, 160, 800];

  const BettingSection = ({ 
    panelId, 
    betAmount, 
    setBetAmount, 
    autoMode, 
    setAutoMode 
  }: {
    panelId: 1 | 2;
    betAmount: number;
    setBetAmount: (amount: number) => void;
    autoMode: boolean;
    setAutoMode: (auto: boolean) => void;
  }) => {
    const bet = panelId === 1 ? bets.panel1 : bets.panel2;
    
    const getButtonText = () => {
      if (isFlying && bet.isPlaced && bet.canCashOut) {
        return `Sacar ${(betAmount * currentMultiplier).toFixed(2)} MZN`;
      }
      if (isFlying && bet.isPlaced && !bet.canCashOut) {
        return 'Sacou!';
      }
      if (isFlying && !bet.isPlaced) {
        return 'Voando...';
      }
      return `Aposta ${betAmount.toFixed(2)} MZN`;
    };

    const isDisabled = (isFlying && (!bet.isPlaced || !bet.canCashOut)) || (isProcessingCashOut && isFlying && bet.canCashOut);

    useEffect(() => {
      if (!isFlying || !bet.canCashOut) {
        setIsProcessingCashOut(false);
      }
    }, [isFlying, bet.canCashOut]);

    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 space-y-3">
        {/* Mode Tabs */}
        <div className="flex rounded-lg overflow-hidden bg-gray-700/50">
          <button 
            onClick={() => setAutoMode(false)}
            className={`flex-1 py-2 text-sm font-medium ${
              !autoMode ? 'bg-gray-600 text-white' : 'text-gray-400'
            }`}
          >
            Aposta
          </button>
          <button 
            onClick={() => setAutoMode(true)}
            className={`flex-1 py-2 text-sm font-medium ${
              autoMode ? 'bg-gray-600 text-white' : 'text-gray-400'
            }`}
          >
            Automático
          </button>
        </div>

        {/* Bet Amount Controls */}
        <div className="space-y-3">
          <div className="flex items-center border border-gray-600 rounded bg-gray-700/50">
            <button 
              onClick={() => setBetAmount(Math.max(1, betAmount - 1))}
              className="px-3 py-3 text-gray-400 hover:text-white text-lg"
              disabled={isFlying}
            >
              −
            </button>
            <div className="flex-1 text-center py-3">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 1;
                  setBetAmount(Math.max(1, value));
                }}
                min="1"
                step="0.01"
                disabled={isFlying}
                className="bg-transparent text-white font-bold text-lg text-center border-none outline-none w-full"
              />
            </div>
            <button 
              onClick={() => setBetAmount(betAmount + 1)}
              className="px-3 py-3 text-gray-400 hover:text-white text-lg"
              disabled={isFlying}
            >
              +
            </button>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => setBetAmount(amount)}
                disabled={isFlying}
                className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-2 rounded disabled:opacity-50 font-medium"
              >
                {amount}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => {
            if (isFlying && bet.canCashOut) {
              if (isProcessingCashOut) return;
              setIsProcessingCashOut(true);
              onCashOut(panelId);
            } else if (!isFlying && betAmount >= 1 && betAmount <= balance) {
              onPlaceBet(betAmount, panelId);
            }
          }}
          disabled={isDisabled}
          className={`w-full py-4 font-bold text-base xs:text-lg ${
            isFlying && bet.canCashOut 
              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {getButtonText()}
        </Button>

        {/* Bet Info */}
        {bet.isPlaced && (
          <div className="text-center text-sm text-gray-400">
            Aposta ativa: {betAmount.toFixed(2)} MZN
            {isFlying && bet.canCashOut && (
              <div className="text-green-400 mt-1">
                Ganho potencial: {(betAmount * currentMultiplier).toFixed(2)} MZN
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 xs:gap-4">
      <BettingSection
        panelId={1}
        betAmount={betAmount1}
        setBetAmount={setBetAmount1}
        autoMode={autoMode1}
        setAutoMode={setAutoMode1}
      />
      <BettingSection
        panelId={2}
        betAmount={betAmount2}
        setBetAmount={setBetAmount2}
        autoMode={autoMode2}
        setAutoMode={setAutoMode2}
      />
    </div>
  );
});