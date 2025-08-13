import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';

interface BetInfo {
  amount: string | number; // string temporária para input
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
    // Estado interno para apostas
    const [bets, setBets] = useState<{ panel1: BetInfo; panel2: BetInfo }>({
      panel1: { amount: '', isPlaced: false, canCashOut: false },
      panel2: { amount: '', isPlaced: false, canCashOut: false },
    });

    // Atualiza valor do input
    const handleChangeAmount = (panel: 1 | 2, value: string) => {
      setBets((prev) => ({
        ...prev,
        [`panel${panel}`]: {
          ...prev[`panel${panel}`],
          amount: value,
        },
      }));
    };

    // Coloca a aposta
    const handlePlaceBet = (panel: 1 | 2) => {
      const betValue = parseFloat(bets[`panel${panel}`].amount as string);
      if (isNaN(betValue) || betValue < 1 || betValue > balance) return;

      setBets((prev) => ({
        ...prev,
        [`panel${panel}`]: {
          ...prev[`panel${panel}`],
          isPlaced: true,
          canCashOut: true,
          amount: betValue, // converte para número só agora
        },
      }));

      onPlaceBet(betValue, panel);
    };

    // Sacar aposta
    const handleCashOut = (panel: 1 | 2) => {
      setBets((prev) => ({
        ...prev,
        [`panel${panel}`]: {
          ...prev[`panel${panel}`],
          isPlaced: false,
          amount: '', // reseta input
          canCashOut: false,
        },
      }));

      onCashOut(panel);
    };

    // Renderiza cada painel
    const renderPanel = (panel: 1 | 2) => {
      const bet = bets[`panel${panel}`];

      return (
        <div key={panel} className="bg-card rounded-xl border border-border/50 p-4">
          <h3 className="text-lg font-bold mb-4 text-center">Aposta {panel}</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text" // agora texto para permitir apagar o zero
                value={bet.amount}
                onChange={(e) => handleChangeAmount(panel, e.target.value)}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                placeholder="Valor da aposta"
                disabled={bet.isPlaced}
              />
              <button
                onClick={() => handlePlaceBet(panel)}
                disabled={
                  bet.isPlaced ||
                  parseFloat(bet.amount as string) < 1 ||
                  parseFloat(bet.amount as string) > balance
                }
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
