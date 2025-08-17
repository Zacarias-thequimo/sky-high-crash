import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BettingPanelProps {
  balance: number;
  betAmount: number;
  setBetAmount: (amount: number) => void;
  onPlaceBet: () => void;
  onCashOut: () => void;
  onCancelBet: () => void;
  isFlying: boolean;
  isBetPlaced: boolean;
  canCashOut: boolean;
  canCancel: boolean;
  currentMultiplier: number;
  isCrashed: boolean;
}

export const BettingPanel = ({
  balance,
  betAmount,
  setBetAmount,
  onPlaceBet,
  onCashOut,
  onCancelBet,
  isFlying,
  isBetPlaced,
  canCashOut,
  canCancel,
  currentMultiplier,
  isCrashed
}: BettingPanelProps) => {
  const [inputValue, setInputValue] = useState(betAmount.toString());

  useEffect(() => {
    setInputValue(betAmount.toString());
  }, [betAmount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setBetAmount(numValue);
    }
  };

  const quickBets = [10, 50, 100, 500];

  const getButtonContent = () => {
    if (isCrashed && isBetPlaced) {
      return 'PERDEU';
    }
    if (isFlying && isBetPlaced && canCashOut) {
      const potentialWin = (betAmount * currentMultiplier).toFixed(2);
      return `SACAR ${potentialWin} MZN`;
    }
    if (isFlying && isBetPlaced && !canCashOut) {
      return 'SACOU!';
    }
    if (isFlying && !isBetPlaced) {
      return 'VOANDO...';
    }
    if (isBetPlaced && canCancel) {
      return 'CANCELAR';
    }
    return `APOSTAR ${betAmount.toFixed(2)} MZN`;
  };

  const getButtonClass = () => {
    if (isCrashed && isBetPlaced) return 'btn-crashed';
    if (isFlying && isBetPlaced && canCashOut) return 'btn-cashout';
    if (isFlying && isBetPlaced && !canCashOut) return 'bg-success text-success-foreground';
    if (isFlying && !isBetPlaced) return 'bg-muted text-muted-foreground cursor-not-allowed';
    if (isBetPlaced && canCancel) return 'btn-cancel';
    return 'btn-bet';
  };

  const isDisabled = (isFlying && !canCashOut && !canCancel) || (!isFlying && !isBetPlaced && (betAmount <= 0 || betAmount > balance));

  const handleAction = () => {
    if (isFlying && canCashOut) {
      onCashOut();
    } else if (canCancel) {
      onCancelBet();
    } else if (!isFlying && !isBetPlaced && betAmount <= balance && betAmount > 0) {
      onPlaceBet();
    }
  };

  return (
    <div className="card-game space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold text-foreground mb-2">Área de Apostas</h3>
        <div className="text-sm text-muted-foreground">
          Saldo: <span className="text-success font-bold">{balance.toFixed(2)} MZN</span>
        </div>
      </div>

      {/* Bet Amount Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Valor da Aposta</label>
        <Input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="0.00"
          disabled={isFlying}
          className="text-center text-lg font-bold bg-input border-border"
          min="0"
          step="0.01"
        />
      </div>

      {/* Quick Bet Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {quickBets.map((amount) => (
          <Button
            key={amount}
            variant="outline"
            size="sm"
            onClick={() => setBetAmount(amount)}
            disabled={isFlying}
            className="text-xs"
          >
            {amount} MZN
          </Button>
        ))}
      </div>

      {/* Bet/Cash Out Button */}
      <Button
        onClick={handleAction}
        disabled={isDisabled}
        className={`w-full text-lg font-bold py-4 ${getButtonClass()}`}
      >
        {getButtonContent()}
      </Button>

      {/* Bet Info */}
      {isBetPlaced && (
        <div className="text-center p-4 bg-accent/50 rounded-lg">
          <div className="text-sm text-muted-foreground">Aposta Ativa</div>
          <div className="text-lg font-bold text-foreground">
            {betAmount.toFixed(2)} MZN
          </div>
          {isFlying && canCashOut && (
            <div className="text-sm text-success mt-1">
              Ganho potencial: {(betAmount * currentMultiplier).toFixed(2)} MZN
            </div>
          )}
        </div>
      )}
    </div>
  );
};