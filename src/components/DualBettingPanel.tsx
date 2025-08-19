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
  const [pendingBet1, setPendingBet1] = useState(false);
  const [pendingBet2, setPendingBet2] = useState(false);

  const [isProcessingCashOut, setIsProcessingCashOut] = useState(false);
  const quickAmounts = [32, 80, 160, 800];

  // Effect to handle pending bets when game starts
  useEffect(() => {
    if (!isFlying && (pendingBet1 || pendingBet2)) {
      // Game just started, process pending bets
      if (pendingBet1 && betAmount1 >= 1 && betAmount1 <= balance) {
        onPlaceBet(betAmount1, 1);
        setPendingBet1(false);
      }
      if (pendingBet2 && betAmount2 >= 1 && betAmount2 <= balance) {
        onPlaceBet(betAmount2, 2);
        setPendingBet2(false);
      }
    }
  }, [isFlying, pendingBet1, pendingBet2, betAmount1, betAmount2, balance, onPlaceBet]);

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
    const isPending = panelId === 1 ? pendingBet1 : pendingBet2;
    const setPending = panelId === 1 ? setPendingBet1 : setPendingBet2;
    
    const getButtonText = () => {
      // If bet is placed and can cash out (yellow button)
      if (bet.isPlaced && bet.canCashOut) {
        return `Sacar ${(betAmount * currentMultiplier).toFixed(2)} USD`;
      }
      
      // If bet is placed but can't cash out anymore
      if (bet.isPlaced && !bet.canCashOut) {
        return 'Sacou!';
      }
      
      // If there's a pending bet (red button)
      if (isPending) {
        return 'Cancelar';
      }
      
      // Default bet button (green)
      return (
        <div className="text-center">
          <div className="text-lg font-bold">Bet</div>
          <div className="text-sm">{betAmount.toFixed(2)} USD</div>
        </div>
      );
    };

    const getButtonColor = () => {
      // Yellow for cash out
      if (bet.isPlaced && bet.canCashOut) {
        return 'bg-yellow-500 hover:bg-yellow-600';
      }
      
      // Gray for already cashed out
      if (bet.isPlaced && !bet.canCashOut) {
        return 'bg-gray-500';
      }
      
      // Red for pending bet
      if (isPending) {
        return 'bg-red-500 hover:bg-red-600';
      }
      
      // Green for normal bet
      return 'bg-green-500 hover:bg-green-600';
    };

    const handleButtonClick = () => {
      // If bet is placed and can cash out
      if (bet.isPlaced && bet.canCashOut) {
        if (isProcessingCashOut) return;
        setIsProcessingCashOut(true);
        onCashOut(panelId);
        return;
      }
      
      // If there's a pending bet, cancel it
      if (isPending) {
        setPending(false);
        return;
      }
      
      // If bet is not placed and amount is valid
      if (!bet.isPlaced && betAmount >= 1 && betAmount <= balance) {
        if (isFlying) {
          // During flight, set as pending
          setPending(true);
        } else {
          // Not flying, place bet immediately
          onPlaceBet(betAmount, panelId);
        }
      }
    };

    const isButtonDisabled = () => {
      // Disable if processing cash out
      if (isProcessingCashOut && bet.canCashOut) return true;
      
      // Disable if bet is placed but can't cash out
      if (bet.isPlaced && !bet.canCashOut) return true;
      
      // Disable if amount is invalid
      if (!bet.isPlaced && !isPending && (betAmount < 1 || betAmount > balance)) return true;
      
      return false;
    };

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
          onClick={handleButtonClick}
          disabled={isButtonDisabled()}
          className={`w-full py-6 font-bold text-lg rounded-lg text-white ${getButtonColor()} ${
            isButtonDisabled() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {getButtonText()}
        </Button>

        {/* Bet Info */}
        {bet.isPlaced && (
          <div className="text-center text-sm text-gray-400">
            Aposta ativa: {betAmount.toFixed(2)} USD
            {bet.canCashOut && (
              <div className="text-green-400 mt-1">
                Ganho potencial: {(betAmount * currentMultiplier).toFixed(2)} USD
              </div>
            )}
          </div>
        )}
        
        {/* Pending Bet Info */}
        {isPending && (
          <div className="text-center text-sm text-orange-400">
            Aposta pendente: {betAmount.toFixed(2)} USD
            <div className="text-xs text-gray-500 mt-1">
              Será processada na próxima rodada
            </div>
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