import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { PlayersList } from '@/components/PlayersList';
import { AviatorGameArea } from '@/components/AviatorGameArea';
import { DualBettingPanel } from '@/components/DualBettingPanel';
import { WithdrawButton } from '@/components/WithdrawButton';
import { useGame } from '@/hooks/useGame';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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

  // Splash state and redirect/splash logic
  const [showSplash, setShowSplash] = useState(false);
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    if (!loading && user) {
      setShowSplash(true);
      const t = setTimeout(() => setShowSplash(false), 5000);
      return () => clearTimeout(t);
    }
  }, [user, loading, navigate]);

  const handlePlaceBet = async (amount: number, panel: 1 | 2) => {
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
    await placeBet(amount);
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col w-full overflow-hidden">
      {/* Header */}
      <Header multiplierHistory={multiplierHistory} balance={balance} />

      {/* Splash Overlay */}
      {showSplash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="text-center space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold tracking-wide text-white">
              AVIATOR <span className="text-primary">powered by 999BETS</span>
            </h1>
            <div
              className="mx-auto h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"
              aria-label="Carregando"
            />
          </div>
        </div>
      )}
      
      {/* Main Layout - Mobile First Responsive */}
      <div className="flex-1 flex flex-col w-full h-full">
        {/* Mobile Layout: Game Area + Betting */}
        <div className="lg:hidden flex flex-col h-full w-full">
          {/* Game Area - Mobile */}
          <div className="flex-1 p-2 w-full">
            <AviatorGameArea
              multiplier={currentMultiplier}
              isFlying={isFlying}
              isCrashed={isCrashed}
              onCashOut={() => handleCashOut(1)}
              canCashOut={canCashOut}
            />
          </div>
          
          {/* Betting Panel - Mobile */}
          <div className="border-t border-gray-700 p-2 w-full">
            <DualBettingPanel
              balance={balance}
              onPlaceBet={handlePlaceBet}
              onCashOut={handleCashOut}
              isFlying={isFlying}
              currentMultiplier={currentMultiplier}
              bets={bets}
            />
          </div>

          {/* Players List - Mobile Bottom */}
          <div className="border-t border-gray-700 w-full">
            <PlayersList 
              totalBets={gameStats.totalBets}
              totalPrize={0}
            />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-1">
          {/* Left Sidebar - Players List - Desktop only */}
          <div className="w-80 border-r border-gray-700">
            <PlayersList 
              totalBets={gameStats.totalBets}
              totalPrize={0}
            />
          </div>
          
          {/* Main Content - Desktop */}
          <div className="flex-1 flex flex-col">
            {/* Game Area - Desktop */}
            <div className="flex-1 p-6">
              <AviatorGameArea
                multiplier={currentMultiplier}
                isFlying={isFlying}
                isCrashed={isCrashed}
                onCashOut={() => handleCashOut(1)}
                canCashOut={canCashOut}
              />
            </div>
            
            {/* Betting Panel - Desktop */}
            <div className="border-t border-gray-700 p-6">
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
    </div>
  );
};

export default Index;
