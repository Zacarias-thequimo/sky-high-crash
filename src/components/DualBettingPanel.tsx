import { useState, memo } from 'react';
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

    const isDisabled = isFlying && (!bet.isPlaced || !bet.canCashOut);

    return (
      <div className="card-glass space-y-4 border-gradient"
           style={{ 
             borderImage: 'linear-gradient(145deg, hsla(120, 100%, 65%, 0.3), hsla(50, 100%, 65%, 0.2)) 1'
           }}>
        {/* Glassmorphism Mode Tabs */}
        <div className="flex rounded-lg overflow-hidden bg-muted/30 backdrop-blur-sm border border-border/50">
          <button 
            onClick={() => setAutoMode(false)}
            className={`flex-1 py-2 text-sm font-medium text-digital transition-all duration-300 ${
              !autoMode 
                ? 'bg-gradient-to-r from-primary/20 to-success/20 text-primary border-r border-primary/30 text-neon' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            APOSTA
          </button>
          <button 
            onClick={() => setAutoMode(true)}
            className={`flex-1 py-2 text-sm font-medium text-digital transition-all duration-300 ${
              autoMode 
                ? 'bg-gradient-to-r from-success/20 to-primary/20 text-success border-l border-success/30 text-neon' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            AUTO
          </button>
        </div>

        {/* Futuristic Bet Amount Controls */}
        <div className="space-y-2">
          <div className="flex items-center card-glass border border-primary/20 bg-muted/20">
            <button 
              onClick={() => setBetAmount(Math.max(1, betAmount - 1))}
              className="px-4 py-3 text-muted-foreground hover:text-primary transition-all duration-300 hover:bg-primary/10 text-digital font-bold disabled:opacity-50"
              disabled={isFlying}
            >
              −
            </button>
            <div className="flex-1 text-center py-3">
              <div className="text-foreground font-bold text-digital text-number">{betAmount.toFixed(2)}</div>
            </div>
            <button 
              onClick={() => setBetAmount(betAmount + 1)}
              className="px-4 py-3 text-muted-foreground hover:text-primary transition-all duration-300 hover:bg-primary/10 text-digital font-bold disabled:opacity-50"
              disabled={isFlying}
            >
              +
            </button>
          </div>

          {/* Glassmorphism Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => setBetAmount(amount)}
                disabled={isFlying}
                className="card-glass border border-success/20 hover:border-success/40 text-foreground text-xs py-2 px-2 font-medium text-digital transition-all duration-300 hover:bg-success/10 hover:text-success disabled:opacity-50 hover:scale-105"
              >
                {amount}
              </button>
            ))}
          </div>
        </div>

        {/* Ultra-Modern Action Button */}
        <Button
          onClick={() => {
            if (isFlying && bet.canCashOut) {
              onCashOut(panelId);
            } else if (!isFlying && betAmount <= balance) {
              onPlaceBet(betAmount, panelId);
            }
          }}
          disabled={isDisabled}
          variant={isFlying && bet.canCashOut ? 'cashout' : 'bet'}
          className={`w-full py-4 text-lg text-digital text-neon ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {getButtonText()}
        </Button>

        {/* Glassmorphism Bet Info */}
        {bet.isPlaced && (
          <div className="text-center text-sm card-glass border border-primary/20 py-3">
            <div className="text-muted-foreground text-digital">
              Aposta ativa: <span className="text-primary font-bold">{betAmount.toFixed(2)} MZN</span>
            </div>
            {isFlying && bet.canCashOut && (
              <div className="text-success mt-1 text-neon text-digital">
                Ganho potencial: <span className="font-bold">{(betAmount * currentMultiplier).toFixed(2)} MZN</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-4">
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