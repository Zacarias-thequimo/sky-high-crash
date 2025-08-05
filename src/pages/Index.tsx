import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { AviatorGameArea } from '@/components/AviatorGameArea';
import { MultiplierReel } from '@/components/MultiplierReel';
import { ActiveBetsTable } from '@/components/ActiveBetsTable';
import { EnhancedBettingPanel } from '@/components/EnhancedBettingPanel';
import { BettingProgressBar } from '@/components/BettingProgressBar';
import { GameFooter } from '@/components/GameFooter';
import { useGame } from '@/hooks/useGame';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  
  const {
    currentMultiplier,
    isFlying,
    isCrashed,
    balance,
    placeBet,
    cashOut,
    multiplierHistory,
    gameStats
  } = useGame();

  const [bets, setBets] = useState({
    panel1: { amount: 1.00, isPlaced: false, canCashOut: false },
    panel2: { amount: 8.00, isPlaced: false, canCashOut: false }
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handlePlaceBet = (amount: number, panel: 1 | 2) => {
    if (panel === 1) {
      setBets(prev => ({
        ...prev,
        panel1: { ...prev.panel1, amount, isPlaced: true, canCashOut: true }
      }));
    } else {
      setBets(prev => ({
        ...prev,
        panel2: { ...prev.panel2, amount, isPlaced: true, canCashOut: true }
      }));
    }
    placeBet();
  };

  const handleCashOut = (panel: 1 | 2) => {
    if (panel === 1) {
      setBets(prev => ({
        ...prev,
        panel1: { ...prev.panel1, canCashOut: false }
      }));
    } else {
      setBets(prev => ({
        ...prev,
        panel2: { ...prev.panel2, canCashOut: false }
      }));
    }
    cashOut();
  };

  const canCashOut = bets.panel1.canCashOut || bets.panel2.canCashOut;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <Header multiplierHistory={multiplierHistory} balance={balance} />
      
      {/* Multiplier Reel */}
      <div className="px-6 py-4">
        <MultiplierReel multiplierHistory={multiplierHistory} />
      </div>
      
      {/* Main Layout */}
      <div className="flex-1 flex gap-6 px-6">
        {/* Left Sidebar - Active Bets */}
        <div className="w-80">
          <ActiveBetsTable bets={[]} currentMultiplier={currentMultiplier} />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col space-y-6">
          {/* Game Area */}
          <div className="flex-1">
            <AviatorGameArea
              multiplier={currentMultiplier}
              isFlying={isFlying}
              isCrashed={isCrashed}
              onCashOut={() => handleCashOut(1)}
              canCashOut={canCashOut}
            />
          </div>
          
          {/* Progress Bar */}
          <BettingProgressBar currentBets={2395} totalBets={6091} />
        </div>
      </div>
      
      {/* Betting Panel */}
      <div className="border-t border-border px-6 py-6">
        <EnhancedBettingPanel
          balance={balance}
          onPlaceBet={handlePlaceBet}
          onCashOut={handleCashOut}
          isFlying={isFlying}
          currentMultiplier={currentMultiplier}
          bets={bets}
        />
      </div>
      
      {/* Footer */}
      <GameFooter />
    </div>
  );
};

export default Index;
