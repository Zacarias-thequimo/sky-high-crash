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
  const { user, profile, loading } = useAuth();
  const {
    currentMultiplier,
    isFlying,
    isCrashed,
    balance,
    placeBet,
    cashOut,
    multiplierHistory,
    gameStats,
    isWaitingForNextRound,
    isBetPlaced,
    canCashOut
  } = useGame();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Handlers para o painel duplo clássico
  // O DualBetPanelClassic espera funções com assinatura específica
  // Para manter a interface igual à das imagens, é possível usar um estado para valores de aposta dos dois painéis
  const [betValues, setBetValues] = useState({ v1: 8, v2: 8 });

  // Controla o estado de aposta para cada painel
  const [betPlaced, setBetPlaced] = useState({ p1: false, p2: false });

  const handlePlaceBet = (amount: number, panel: 1 | 2) => {
    // Atualiza valor e status de aposta para o painel
    setBetValues((prev) => ({
      ...prev,
      [`v${panel}`]: amount
    }));
    setBetPlaced((prev) => ({
      ...prev,
      [`p${panel}`]: true
    }));
    placeBet(); // Chama lógica global de aposta
  };

  const handleCashOut = (panel: 1 | 2) => {
    setBetPlaced((prev) => ({
      ...prev,
      [`p${panel}`]: false
    }));
    cashOut();
  };

  return (
    <div className="min-h-screen bg-[#181c23] text-white flex flex-col font-sans">
      {/* Header com saldo topo */}
      <Header multiplierHistory={multiplierHistory} balance={balance} />

      {/* Barra de multiplicadores central */}
      <MultiplierHistoryBar history={multiplierHistory} />

      <div className="flex-1 flex bg-[#181c23]">
        {/* Sidebar esquerda */}
        <div className="w-[370px] bg-[#181c23] border-r border-[#23262c]">
          <PlayersList 
            totalBets={gameStats.totalBets}
            totalPrize={0}
          />
        </div>

        {/* Área principal - gráfico/avião e apostas */}
        <div className="flex-1 flex flex-col">
          {/* Área do Aviator - gráfico e avião */}
          <div className="flex-1 relative bg-[#181c23] flex items-center justify-center">
            <div className="w-full h-[350px] bg-[#111216] border border-[#23262c] rounded-lg relative overflow-hidden flex items-center justify-center">
              {/* Componente do gráfico e avião */}
              <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                <GameArea
                  multiplier={currentMultiplier}
                  isFlying={isFlying}
                  isCrashed={isCrashed}
                  onCashOut={() => {
                    // Cash out global para o painel ativo
                    if (betPlaced.p1) handleCashOut(1);
                    if (betPlaced.p2) handleCashOut(2);
                  }}
                  canCashOut={canCashOut}
                />
              </div>
              {/* Avatares/contador de jogadores online canto inferior direito */}
              <div className="absolute bottom-4 right-6 flex items-center gap-1">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#23262c] border-2 border-[#23262c] flex items-center justify-center">
                    <img src="/avatar1.png" alt="avatar" className="rounded-full w-7 h-7" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#23262c] border-2 border-[#23262c] flex items-center justify-center -ml-3">
                    <img src="/avatar2.png" alt="avatar" className="rounded-full w-7 h-7" />
                  </div>
                </div>
                <span className="text-[#f4f4f4] font-bold ml-2 text-lg">2,076</span>
              </div>
            </div>
          </div>

          {/* Painéis de aposta duplos */}
          <div className="bg-[#181c23] border-t border-[#23262c] px-0 py-5 flex justify-center items-center">
            <DualBetPanelClassic
              balance={balance}
              onPlaceBet={handlePlaceBet}
              onCashOut={handleCashOut}
              isFlying={isFlying}
              currentMultiplier={currentMultiplier}
            />
          </div>
        </div>
      </div>
      {/* Chat flutuante */}
      <div className="fixed bottom-7 right-8 z-50">
        <button className="rounded-full bg-[#ffe100] shadow-lg w-16 h-16 flex items-center justify-center border-none">
          <span className="text-[#181c23] text-3xl font-black">💬</span>
        </button>
      </div>
    </div>
  );
};

export default Index;
