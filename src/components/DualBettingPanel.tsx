import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';

interface BetInfo {
  amount: number;
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
    // Estado local para apostas antes de serem confirmadas
    const [bets, setBets] = useState<{ panel1: BetInfo; panel2: BetInfo }>({
      panel1: { amount: 0, isPlaced: false, canCashOut: false },
      panel2: { amount: 0, isPlaced: false, canCashOut: false },
    });

    const handlePlaceBet = (panel: 1 | 2) => {
      const betAmount = panel === 1 ? bets.panel1.amount : bets.panel2.amount;
      if (betAmount < 1 || betAmount > balance) return;

      // Marca a aposta como colocada
      setBets((prev) => ({
        ...prev,
        [`panel${panel}`]: {
          ...prev[`panel${panel}`],
          isPlaced: true,
          canCashOut: true, // você pode controlar isso dinamicamente
        },
      }));

      onPlaceBet(betAmount, panel);
    };

    const handleChangeAmount = (panel: 1 | 2, value: number) => {
      setBets((prev) => ({
        ...prev,
        [`panel${panel}`]: {
          ...prev[`panel${panel}`],
          amount: value,
        },
      }));
    };

    const handleCashOut = (panel: 1 | 2) => {
      setBets((prev) => ({
        ...prev,
        [`panel${panel}`]: {
          ...prev[`panel${panel}`],
          isPlaced: false,
          amount: 0, // reseta valor após sacar
          canCashOut: false,
        },
      }));

      onCashOut(panel);
    };

    const renderPanel = (panel: 1 | 2) => {
      const bet = bets[`panel${panel}`];
      return (
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h3 className="text-lg font-bold mb-4 text-center">Aposta {panel}</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                value={bet.amount}
                onChange={(e) => handleChangeAmount(panel, parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                placeholder="Valor da aposta"
                disabled={bet.isPlaced}
                min={1}
                step={0.01}
              />
              <button
                onClick={() => handlePlaceBet(panel)}
                disabled={bet.isPlaced || bet.amount < 1 || bet.amount > balance}
                className="px-4 py-2 bg-success text-success-foreground rounded-lg text-sm font-medium hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apostar
              </button>
            </div>

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
