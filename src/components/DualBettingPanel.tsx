import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';

interface BetInfo {
  amount: string | number;
  isPlaced: boolean;
  canCashOut: boolean;
}

interface DualBettingPanelProps {
  balance: number;
  onPlaceBet: (amount: number, panel: 1 | 2) => void;
  onCashOut: (panel: 1 | 2) => void;
  isFlying: boolean;
  currentMultiplier: number;
}

export const DualBettingPanel = memo(
  ({
    balance,
    onPlaceBet,
    onCashOut,
    isFlying,
    currentMultiplier,
  }: DualBettingPanelProps) => {
    const [bets, setBets] = useState<{ panel1: BetInfo; panel2: BetInfo }>({
      panel1: { amount: '', isPlaced: false, canCashOut: false },
      panel2: { amount: '', isPlaced: false, canCashOut: false },
    });

    const quickAmounts = [10, 50, 100];

    const handleChangeAmount = (panel: 1 | 2, value: string) => {
      setBets((prev) => ({
        ...prev,
        [`panel${panel}`]: {
          ...prev[`panel${panel}`],
          amount: value,
        },
      }));
    };

    const handleQuickAmount = (panel: 1 | 2, value: number) => {
      setBets((prev) => ({
        ...prev,
        [`panel${panel}`]: {
          ...prev[`panel${panel}`],
          amount: value.toString(),
        },
      }));
    };

    const handlePlaceBet = (panel: 1 | 2) => {
      const betValue = parseFloat(bets[`panel${panel}`].amount as string);
      if (isNaN(betValue) || betValue < 1 || betValue > balance) return;

      setBets((prev) => ({
        ...prev,
        [`panel${panel}`]: {
          ...prev[`panel${panel}`],
          isPlaced: true,
          canCashOut: true,
          amount: betValue,
        },
      }));

      onPlaceBet(betValue, panel);
    };

    const handleCashOut = (panel: 1 | 2) => {
      setBets((prev) => ({
        ...prev,
        [`panel${panel}`]: {
          ...prev[`panel${panel}`],
          isPlaced: false,
          amount: '',
          canCashOut: false,
        },
      }));

      onCashOut(panel);
    };

    const renderPanel = (panel: 1 | 2) => {
      const bet = bets[`panel${panel}`];
      const betValue = bet.amount === '' ? 0 : parseFloat(bet.amount as string);
      const isValidAmount = betValue >= 1 && betValue <= balance;

      return (
        <div key={panel} className="bg-card rounded-xl border border-border/50 p-4">
          <h3 className="text-lg font-bold mb-4 text-center">Aposta {panel}</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={bet.amount}
                onChange={(e) => handleChangeAmount(panel, e.target.value)}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                placeholder="Valor da aposta"
                disabled={bet.isPlaced}
              />
              <button
                onClick={() => handlePlaceBet(panel)}
                disabled={bet.isPlaced || !isValidAmount}
                className="px-4 py-2 bg-success text-success-foreground rounded-lg text-sm font-medium hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apostar
              </button>
            </div>

            {/* Botões rápidos */}
            {!bet.isPlaced && (
              <div className="flex gap-2 mt-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleQuickAmount(panel, amount)}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
                  >
                    {amount} MZN
                  </button>
                ))}
              </div>
            )}

            {bet.isPlaced && (
              <button
                onClick={() => handleCashOut(panel)}
                disabled={!bet.canCashOut}
                className="w-full px-4 py-2 bg-warning text-warning-foreground rounded-lg text-sm font-medium hover:bg-warning/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sacar {currentMultiplier.toFixed(2)}x
              </button>
            )}
          </div>
        </div>
      );
    };

    return <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{[1, 2].map(renderPanel)}</div>;
  }
);
