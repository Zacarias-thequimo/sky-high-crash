import { useState, memo } from 'react';
import { Button } from '@/components/ui/button';

interface DualBettingPanelProps {
  balance: number;
  onPlaceBet: (amount: number, panel: 1 | 2) => void;
  onCashOut: (panel: 1 | 2) => void;
  onCancelBet: (panel: 1 | 2) => void;
  isFlying: boolean;
  currentMultiplier: number;
  bets: {
    panel1: { amount: number; isPlaced: boolean; canCashOut: boolean; canCancel: boolean };
    panel2: { amount: number; isPlaced: boolean; canCashOut: boolean; canCancel: boolean };
  };
}

export const DualBettingPanel = memo(({
  balance,
  onPlaceBet,
  onCashOut,
  onCancelBet,
  isFlying,
  currentMultiplier,
  bets
}: DualBettingPanelProps) => {
  const [betAmount1, setBetAmount1] = useState(1.00);
  const [betAmount2, setBetAmount2] = useState(8.00);
  const [autoMode1, setAutoMode1] = useState(false);
  const [autoMode2, setAutoMode2] = useState(false);

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
        const potentialWin = (betAmount * currentMultiplier).toFixed(2);
        return `SACAR ${potentialWin} MZN`;
      }
      if (isFlying && bet.isPlaced && !bet.canCashOut) {
        return 'SACOU!';
      }
      if (isFlying && !bet.isPlaced) {
        return 'VOANDO...';
      }
      if (bet.isPlaced && bet.canCancel) {
        return 'CANCELAR';
      }
      return `APOSTAR ${betAmount.toFixed(2)} MZN`;
    };

    const getButtonClass = () => {
      if (isFlying && bet.isPlaced && bet.canCashOut) return 'btn-cashout';
      if (isFlying && bet.isPlaced && !bet.canCashOut) return 'bg-success text-success-foreground';
      if (isFlying && !bet.isPlaced) return 'bg-muted text-muted-foreground cursor-not-allowed';
      if (bet.isPlaced && bet.canCancel) return 'btn-cancel';
      return 'btn-bet';
    };

    const isDisabled = (isFlying && !bet.canCashOut && !bet.canCancel) || (!isFlying && !bet.isPlaced && (betAmount <= 0 || betAmount > balance));

    const handleAction = () => {
      if (isFlying && bet.canCashOut) {
        onCashOut(panelId);
      } else if (bet.canCancel) {
        onCancelBet(panelId);
      } else if (!isFlying && !bet.isPlaced && betAmount <= balance && betAmount > 0) {
        onPlaceBet(betAmount, panelId);
      }
    };

    return (
      <div className="card-game space-y-3">
        {/* Mode Tabs */}
        <div className="flex rounded-lg overflow-hidden bg-muted/50">
          <button 
            onClick={() => setAutoMode(false)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              !autoMode ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Aposta
          </button>
          <button 
            onClick={() => setAutoMode(true)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              autoMode ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Automático
          </button>
        </div>

        {/* Bet Amount Controls */}
        <div className="space-y-3">
          <div className="flex items-center border border-border rounded bg-input">
            <button 
              onClick={() => setBetAmount(Math.max(1, betAmount - 1))}
              className="px-3 py-3 text-muted-foreground hover:text-foreground text-lg transition-colors"
              disabled={isFlying}
            >
              −
            </button>
            <div className="flex-1 text-center py-3">
              <div className="text-foreground font-bold text-lg">{betAmount.toFixed(2)}</div>
            </div>
            <button 
              onClick={() => setBetAmount(betAmount + 1)}
              className="px-3 py-3 text-muted-foreground hover:text-foreground text-lg transition-colors"
              disabled={isFlying}
            >
              +
            </button>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                onClick={() => setBetAmount(amount)}
                disabled={isFlying}
                variant="outline"
                size="sm"
                className="text-xs font-medium"
              >
                {amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleAction}
          disabled={isDisabled}
          className={`w-full py-4 font-bold text-base transition-all ${getButtonClass()}`}
        >
          {getButtonText()}
        </Button>

        {/* Bet Info */}
        {bet.isPlaced && (
          <div className="text-center p-3 bg-accent/50 rounded-lg">
            <div className="text-sm text-muted-foreground">Aposta ativa</div>
            <div className="text-lg font-bold text-foreground">
              {betAmount.toFixed(2)} MZN
            </div>
            {isFlying && bet.canCashOut && (
              <div className="text-sm text-success mt-1">
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