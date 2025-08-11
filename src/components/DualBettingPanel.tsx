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

export const DualBettingPanel = memo(
  ({
    balance,
    onPlaceBet,
    onCashOut,
    isFlying,
    currentMultiplier,
    bets,
  }: DualBettingPanelProps) => {
    const [betAmount1, setBetAmount1] = useState(1.0);
    const [betAmount2, setBetAmount2] = useState(8.0);
    const [autoMode1, setAutoMode1] = useState(false);
    const [autoMode2, setAutoMode2] = useState(false);

    const quickAmounts = [32, 80, 160, 800];

    const BettingSection = ({
      panelId,
      betAmount,
      setBetAmount,
      autoMode,
      setAutoMode,
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
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-4">
          {/* Mode Tabs */}
          <div className="flex rounded-lg overflow-hidden bg-gray-700/50">
            <button
              onClick={() => setAutoMode(false)}
              className={`flex-1 py-2 text-sm font-medium ${
                !autoMode ? 'bg-gray-600 text-white' : 'text-gray-400'
              }`}
            >
              Aposta
            </button>
            <button
              onClick={() => setAutoMode(true)}
              className={`flex-1 py-2 text-sm font-medium ${
                autoMode ? 'bg-gray-600 text-white' : 'text-gray-400'
              }`}
            >
              Automático
            </button>
          </div>

          {/* Bet Amount Controls */}
          <div className="space-y-2">
            <div className="flex items-center border border-gray-600 rounded bg-gray-700/50">
              <button
                onClick={() => setBetAmount(Math.max(1, betAmount - 1))}
                className="px-3 py-2 text-gray-400 hover:text-white"
                disabled={isFlying}
              >
                −
              </button>
              <div className="flex-1 text-center py-2">
                <div className="text-white font-bold">
                  {betAmount.toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => setBetAmount(betAmount + 1)}
                className="px-3 py-2 text-gray-400 hover:text-white"
                disabled={isFlying}
              >
                +
              </button>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-1">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  disabled={isFlying}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-xs py-1 px-2 rounded disabled:opacity-50"
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => {
              if (isFlying && bet.canCashOut) {
                onCashOut(panelId);
              } else if (!isFlying && betAmount <= balance) {
                onPlaceBet(betAmount, panelId);
              }
            }}
            disabled={isDisabled}
            className={`w-full py-4 font-bold text-lg ${
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
                  Ganho potencial:{' '}
                  {(betAmount * currentMultiplier).toFixed(2)} MZN
                </div>
              )}
            </div>
          )}
        </div>
      );
    };

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
              />
              <button
                onClick={() => onPlaceBet(bets.panel1.amount, 1)}
                disabled={bets.panel1.isPlaced}
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
                Sacar {multiplier.toFixed(2)}x
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
              />
              <button
                onClick={() => onPlaceBet(bets.panel2.amount, 2)}
                disabled={bets.panel2.isPlaced}
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
                Sacar {multiplier.toFixed(2)}x
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);
