import { memo } from 'react';

interface Bet {
  player: string;
  amount: number;
  multiplier: number;
  winAmount: number;
}

interface ActiveBetsTableProps {
  bets: Bet[];
  currentMultiplier: number;
}

export const ActiveBetsTable = memo(({ bets, currentMultiplier }: ActiveBetsTableProps) => {
  // Mock data for demonstration
  const mockBets: Bet[] = [
    { player: "João S.", amount: 50.00, multiplier: 2.45, winAmount: 122.50 },
    { player: "Maria L.", amount: 25.00, multiplier: 1.85, winAmount: 46.25 },
    { player: "Pedro M.", amount: 100.00, multiplier: 3.20, winAmount: 320.00 },
    { player: "Ana C.", amount: 15.00, multiplier: 1.50, winAmount: 22.50 },
    { player: "Carlos R.", amount: 75.00, multiplier: 2.80, winAmount: 210.00 },
    { player: "Lucia F.", amount: 30.00, multiplier: 4.10, winAmount: 123.00 },
    { player: "Manuel D.", amount: 40.00, multiplier: 1.95, winAmount: 78.00 },
    { player: "Sofia T.", amount: 60.00, multiplier: 2.65, winAmount: 159.00 },
  ];

  const activeBets = bets.length > 0 ? bets : mockBets;

  return (
    <div className="bg-card/30 rounded-lg border border-border/50 h-full">
      <div className="p-4 border-b border-border/50">
        <h3 className="text-lg font-bold text-foreground">Apostas Ativas</h3>
        <p className="text-muted-foreground text-sm">Multiplicador atual: {currentMultiplier.toFixed(2)}x</p>
      </div>
      
      <div className="overflow-auto max-h-[600px]">
        <table className="w-full">
          <thead className="bg-secondary/30 sticky top-0">
            <tr>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Jogador</th>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground">Aposta</th>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground">Mult.</th>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground">Ganho</th>
            </tr>
          </thead>
          <tbody>
            {activeBets.map((bet, index) => (
              <tr key={index} className="border-b border-border/20 hover:bg-secondary/20">
                <td className="p-3">
                  <span className="text-foreground font-medium">{bet.player}</span>
                </td>
                <td className="p-3 text-right">
                  <span className="text-warning font-bold">{bet.amount.toFixed(2)} MZN</span>
                </td>
                <td className="p-3 text-right">
                  <span className="text-success font-bold">{bet.multiplier.toFixed(2)}x</span>
                </td>
                <td className="p-3 text-right">
                  <span className="text-profit font-bold">{bet.winAmount.toFixed(2)} MZN</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-3 border-t border-border/50 bg-secondary/20">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total de apostas:</span>
          <span className="text-foreground font-bold">{activeBets.length}</span>
        </div>
      </div>
    </div>
  );
});