import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Minus, Plus } from 'lucide-react';

interface BetPanelData {
  amount: number;
  isPlaced: boolean;
  canCashOut: boolean;
}

interface EnhancedBettingPanelProps {
  balance: number;
  onPlaceBet: (amount: number, panel: 1 | 2) => void;
  onCashOut: (panel: 1 | 2) => void;
  isFlying: boolean;
  currentMultiplier: number;
  bets: {
    panel1: BetPanelData;
    panel2: BetPanelData;
  };
}

export const EnhancedBettingPanel = memo(({ 
  balance, 
  onPlaceBet, 
  onCashOut, 
  isFlying, 
  currentMultiplier, 
  bets 
}: EnhancedBettingPanelProps) => {
  const [betAmount1, setBetAmount1] = useState(1.00);
  const [betAmount2, setBetAmount2] = useState(5.00);
  const [autoMode1, setAutoMode1] = useState(false);
  const [autoMode2, setAutoMode2] = useState(false);

  const quickAmounts = [1, 5, 10, 25, 50, 100];

  const adjustAmount = (panel: 1 | 2, increment: boolean) => {
    const currentAmount = panel === 1 ? betAmount1 : betAmount2;
    const setAmount = panel === 1 ? setBetAmount1 : setBetAmount2;
    
    const step = increment ? 1 : -1;
    const newAmount = Math.max(1, currentAmount + step);
    setAmount(newAmount);
  };

  const BettingSection = ({ 
    panelNumber, 
    amount, 
    setAmount, 
    autoMode, 
    setAutoMode, 
    bet 
  }: {
    panelNumber: 1 | 2;
    amount: number;
    setAmount: (amount: number) => void;
    autoMode: boolean;
    setAutoMode: (auto: boolean) => void;
    bet: BetPanelData;
  }) => {
    const getButtonText = () => {
      if (isFlying) {
        if (bet.isPlaced && bet.canCashOut) {
          return `SACAR ${(amount * currentMultiplier).toFixed(2)} MZN`;
        }
        return 'VOANDO...';
      }
      return `APOSTAR ${amount.toFixed(2)} MZN`;
    };

    const getButtonClass = () => {
      if (isFlying) {
        if (bet.isPlaced && bet.canCashOut) {
          return 'bg-warning hover:bg-warning/90 text-warning-foreground animate-pulse';
        }
        return 'bg-muted text-muted-foreground cursor-not-allowed';
      }
      return 'bg-success hover:bg-success/90 text-success-foreground';
    };

    const isDisabled = isFlying && (!bet.isPlaced || !bet.canCashOut);

    const handleAction = () => {
      if (isFlying && bet.canCashOut) {
        onCashOut(panelNumber);
      } else if (!isFlying) {
        onPlaceBet(amount, panelNumber);
      }
    };

    return (
      <div className="bg-card/30 border border-border/50 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground font-bold">Aposta {panelNumber}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground text-sm">Auto</span>
            <Switch 
              checked={autoMode} 
              onCheckedChange={setAutoMode}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>

        {/* Amount Input with +/- buttons */}
        <div className="space-y-2">
          <label className="text-muted-foreground text-sm">Valor da aposta</label>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustAmount(panelNumber, false)}
              className="border-border hover:bg-secondary"
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, parseFloat(e.target.value) || 1))}
              className="text-center bg-input border-border text-foreground"
              min="1"
              step="0.01"
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustAmount(panelNumber, true)}
              className="border-border hover:bg-secondary"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {quickAmounts.map((quickAmount) => (
            <Button
              key={quickAmount}
              variant="outline"
              size="sm"
              onClick={() => setAmount(quickAmount)}
              className="border-border hover:bg-secondary text-xs"
            >
              {quickAmount} MZN
            </Button>
          ))}
        </div>

        {/* Main Action Button */}
        <Button
          onClick={handleAction}
          disabled={isDisabled}
          className={`w-full h-12 text-lg font-bold transition-all duration-300 ${getButtonClass()}`}
        >
          {getButtonText()}
        </Button>

        {/* Bet Info */}
        {bet.isPlaced && (
          <div className="bg-secondary/30 rounded-md p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Aposta:</span>
              <span className="text-foreground font-medium">{amount.toFixed(2)} MZN</span>
            </div>
            {isFlying && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ganho potencial:</span>
                <span className="text-profit font-bold">{(amount * currentMultiplier).toFixed(2)} MZN</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Painel de Apostas</h2>
        <div className="text-success font-bold text-lg">
          Saldo: {balance.toFixed(2)} MZN
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BettingSection
          panelNumber={1}
          amount={betAmount1}
          setAmount={setBetAmount1}
          autoMode={autoMode1}
          setAutoMode={setAutoMode1}
          bet={bets.panel1}
        />
        
        <BettingSection
          panelNumber={2}
          amount={betAmount2}
          setAmount={setBetAmount2}
          autoMode={autoMode2}
          setAutoMode={setAutoMode2}
          bet={bets.panel2}
        />
      </div>
    </div>
  );
});