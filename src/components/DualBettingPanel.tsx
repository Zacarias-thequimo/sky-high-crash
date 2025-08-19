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
      return (
        <div className="text-center">
          <div className="text-lg font-bold">Bet</div>
          <div className="text-sm">{betAmount.toFixed(2)} USD</div>
        </div>
      );
    };

    const isDisabled = (isFlying && (!bet.isPlaced || !bet.canCashOut)) || (isProcessingCashOut && isFlying && bet.canCashOut);

    useEffect(() => {
      if (!isFlying || !bet.canCashOut) {
        setIsProcessingCashOut(false);
      }
    }, [isFlying, bet.canCashOut]);

    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 space-y-4">
        {/* Mode Tabs */}
        <div className="flex rounded overflow-hidden">
          <button 
            onClick={() => setAutoMode(false)}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
              !autoMode ? 'bg-white text-black' : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            Bet
          </button>
          <button 
            onClick={() => setAutoMode(true)}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
              autoMode ? 'bg-white text-black' : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            Auto
          </button>
        </div>

        {/* Bet Amount Controls */}
        <div className="space-y-4">
          <div className="flex items-center bg-gray-700 rounded-lg">
            <button 
              onClick={() => setBetAmount(Math.max(1, betAmount - 1))}
              className="px-4 py-3 text-white hover:bg-gray-600 rounded-l-lg text-xl font-bold"
              disabled={isFlying}
            >
              −
            </button>
            <div className="flex-1 text-center py-3 bg-gray-700">
              <div className="text-white font-bold text-xl">
                {betAmount.toFixed(2)}
              </div>
            </div>
            <button 
              onClick={() => setBetAmount(betAmount + 1)}
              className="px-4 py-3 text-white hover:bg-gray-600 rounded-r-lg text-xl font-bold"
              disabled={isFlying}
            >
              +
            </button>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setBetAmount(1)}
              disabled={isFlying}
              className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 rounded disabled:opacity-50 font-medium"
            >
              1
            </button>
            <button
              onClick={() => setBetAmount(2)}
              disabled={isFlying}
              className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 rounded disabled:opacity-50 font-medium"
            >
              2
            </button>
            <button
              onClick={() => setBetAmount(5)}
              disabled={isFlying}
              className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 rounded disabled:opacity-50 font-medium"
            >
              5
            </button>
            <button
              onClick={() => setBetAmount(10)}
              disabled={isFlying}
              className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 rounded disabled:opacity-50 font-medium"
            >
              10
            </button>
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
          className={`w-full py-6 font-bold text-lg rounded-lg ${
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