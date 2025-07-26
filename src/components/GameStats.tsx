interface GameStatsProps {
  totalBets: number;
  totalWins: number;
  totalLosses: number;
  biggestWin: number;
  currentStreak: number;
  isWinStreak: boolean;
}

export const GameStats = ({
  totalBets,
  totalWins,
  totalLosses,
  biggestWin,
  currentStreak,
  isWinStreak
}: GameStatsProps) => {
  const winRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;

  return (
    <div className="card-game">
      <h3 className="text-lg font-bold text-foreground mb-4 text-center">
        Estatísticas do Jogo
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Total Bets */}
        <div className="text-center p-3 bg-accent/30 rounded-lg">
          <div className="text-2xl font-bold text-primary">
            {totalBets}
          </div>
          <div className="text-xs text-muted-foreground">
            Total de Apostas
          </div>
        </div>

        {/* Win Rate */}
        <div className="text-center p-3 bg-accent/30 rounded-lg">
          <div className="text-2xl font-bold text-success">
            {winRate.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">
            Taxa de Vitória
          </div>
        </div>

        {/* Wins */}
        <div className="text-center p-3 bg-accent/30 rounded-lg">
          <div className="text-2xl font-bold text-success">
            {totalWins}
          </div>
          <div className="text-xs text-muted-foreground">
            Vitórias
          </div>
        </div>

        {/* Losses */}
        <div className="text-center p-3 bg-accent/30 rounded-lg">
          <div className="text-2xl font-bold text-crash">
            {totalLosses}
          </div>
          <div className="text-xs text-muted-foreground">
            Derrotas
          </div>
        </div>

        {/* Biggest Win */}
        <div className="text-center p-3 bg-accent/30 rounded-lg col-span-2">
          <div className="text-3xl font-bold text-warning">
            {biggestWin.toFixed(2)}x
          </div>
          <div className="text-xs text-muted-foreground">
            Maior Multiplicador
          </div>
        </div>

        {/* Current Streak */}
        <div className="text-center p-3 bg-accent/30 rounded-lg col-span-2">
          <div className={`text-2xl font-bold ${
            isWinStreak ? 'text-success' : 'text-crash'
          }`}>
            {currentStreak} {isWinStreak ? '🔥' : '❄️'}
          </div>
          <div className="text-xs text-muted-foreground">
            Sequência Atual ({isWinStreak ? 'Vitórias' : 'Derrotas'})
          </div>
        </div>
      </div>
    </div>
  );
};