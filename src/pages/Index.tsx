import { GameArea } from '@/components/GameArea';
import { BettingPanel } from '@/components/BettingPanel';
import { MultiplierHistory } from '@/components/MultiplierHistory';
import { GameStats } from '@/components/GameStats';
import { useGame } from '@/hooks/useGame';

const Index = () => {
  const {
    currentMultiplier,
    isFlying,
    isCrashed,
    isWaitingForNextRound,
    balance,
    betAmount,
    setBetAmount,
    isBetPlaced,
    canCashOut,
    placeBet,
    cashOut,
    multiplierHistory,
    gameStats
  } = useGame();

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="text-center">
          <h1 className="text-4xl font-black bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-2">
            SkyCrash ✈️
          </h1>
          <p className="text-muted-foreground">
            Saque antes do crash e multiplique seus ganhos!
          </p>
        </div>
      </div>

      {/* Main Game Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Area - Takes most space */}
        <div className="lg:col-span-3">
          <GameArea
            multiplier={currentMultiplier}
            isFlying={isFlying}
            isCrashed={isCrashed}
            onCashOut={cashOut}
            canCashOut={canCashOut && isBetPlaced}
          />
        </div>

        {/* Betting Panel */}
        <div className="space-y-6">
          <BettingPanel
            balance={balance}
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            onPlaceBet={placeBet}
            onCashOut={cashOut}
            isFlying={isFlying}
            isBetPlaced={isBetPlaced}
            canCashOut={canCashOut}
            currentMultiplier={currentMultiplier}
            isCrashed={isCrashed}
          />
        </div>
      </div>

      {/* Bottom Section - Stats and History */}
      <div className="max-w-7xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multiplier History */}
        <MultiplierHistory history={multiplierHistory} />
        
        {/* Game Statistics */}
        <GameStats
          totalBets={gameStats.totalBets}
          totalWins={gameStats.totalWins}
          totalLosses={gameStats.totalLosses}
          biggestWin={gameStats.biggestWin}
          currentStreak={gameStats.currentStreak}
          isWinStreak={gameStats.isWinStreak}
        />
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 text-center text-sm text-muted-foreground">
        <p>SkyCrash v1.0 - Jogo responsável. Aposte com moderação.</p>
      </div>
    </div>
  );
};

export default Index;
