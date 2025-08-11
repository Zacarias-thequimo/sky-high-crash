import { memo } from 'react';
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
  bets: {
    panel1: BetInfo;
    panel2: BetInfo;
  };
  setBets: React.Dispatch<
    React.SetStateAction<{
      panel1: BetInfo;
      panel2: BetInfo;
    }>
  >;
}

export const DualBettingPanel = memo(
  ({
    balance,
    onPlaceBet,
    onCashOut,
    isFlying,
    currentMultiplier,
    bets,
    setBets,
  }: DualBettingPanelProps) => {
    // quickAmounts pode continuar aqui se quiser usar em botões rápidos.

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Painel 1 */}
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h3 className="text-lg font-bold mb-4 text-center">Aposta 1</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                value={bets.panel1.amount}
                onChange={(e) =>
                  setBets((prev) => ({
                    ...prev,
                    panel1: {
                      ...prev.panel1,
                      amount: parseFloat(e.target.value) || 0,
                    },
                  }))
                }
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                placeholder="Valor da aposta"
                disabled={bets.panel1.isPlaced}
                min={1}
                step={0.01}
              />
              <button
                onClick={() => onPlaceBet(bets.panel1.amount, 1)}
                disabled={
                  bets.panel1.isPlaced || bets.panel1.amount > balance || bets.panel1.amount < 1
                }
                className="px-4 py-2 bg-success text-success-foreground rounded-lg text-sm font-medium hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apostar
              </button>
            </div>

            {bets.panel1.isPlaced && (
              <button
                onClick={() => onCashOut(1)}
                disabled={!bets.panel1.canCashOut}
                className="w-full px-4 py-2 bg-warning text-warning-foreground rounded-lg text-sm font-medium hover:bg-warning/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sacar {currentMultiplier.toFixed(2)}x
              </button>
            )}
          </div>
        </div>

        {/* Painel 2 */}
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h3 className="text-lg font-bold mb-4 text-center">Aposta 2</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                value={bets.panel2.amount}
                onChange={(e) =>
                  setBets((prev) => ({
                    ...prev,
                    panel2: {
                      ...prev.panel2,
                      amount: parseFloat(e.target.value) || 0,
                    },
                  }))
                }
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                placeholder="Valor da aposta"
                disabled={bets.panel2.isPlaced}
                min={1}
                step={0.01}
              />
              <button
                onClick={() => onPlaceBet(bets.panel2.amount, 2)}
                disabled={
                  bets.panel2.isPlaced || bets.panel2.amount > balance || bets.panel2.amount < 1
                }
                className="px-4 py-2 bg-success text-success-foreground rounded-lg text-sm font-medium hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apostar
              </button>
            </div>

            {bets.panel2.isPlaced && (
              <button
                onClick={() => onCashOut(2)}
                disabled={!bets.panel2.canCashOut}
                className="w-full px-4 py-2 bg-warning text-warning-foreground rounded-lg text-sm font-medium hover:bg-warning/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sacar {currentMultiplier.toFixed(2)}x
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);
