import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { PlayersList } from '@/components/PlayersList';
import { AviatorGameArea } from '@/components/AviatorGameArea';
import { DualBettingPanel } from '@/components/DualBettingPanel';
import { useGame } from '@/hooks/useGame';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen text-foreground flex flex-col" style={{ background: 'var(--background-gradient)' }}>
      {/* Header */}
      <Header multiplierHistory={multiplierHistory} balance={balance} />
      
      {/* Main Layout */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Players List */}
        <div className="w-80 border-r border-border">
          <PlayersList 
            totalBets={gameStats.totalBets}
            totalPrize={0}
          />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Game Area */}
          <div className="flex-1 p-6">
            <AviatorGameArea
              multiplier={currentMultiplier}
              isFlying={isFlying}
              isCrashed={isCrashed}
              onCashOut={() => handleCashOut(1)}
              canCashOut={canCashOut}
            />
          </div>
          
          {/* Betting Panel */}
          <div className="border-t border-border p-6">
            <DualBettingPanel
              balance={balance}
              onPlaceBet={handlePlaceBet}
              onCashOut={handleCashOut}
              isFlying={isFlying}
              currentMultiplier={currentMultiplier}
              bets={bets}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
