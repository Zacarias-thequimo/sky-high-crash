import { useState, useEffect, useCallback, useMemo } from 'react';
import { GameEngine, initializeGame, calculateProfit, calculatePayout } from '@/utils/gameLogic';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface GameStats {
  totalBets: number;
  totalWins: number;
  totalLosses: number;
  biggestWin: number;
  currentStreak: number;
  isWinStreak: boolean;
}

export const useGame = () => {
  const { toast } = useToast();
  
  // Game state
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [isFlying, setIsFlying] = useState(false);
  const [isCrashed, setIsCrashed] = useState(false);
  const [isWaitingForNextRound, setIsWaitingForNextRound] = useState(true);
  
  // Player state
  const [balance, setBalance] = useState(0); // Starting balance from deposits only
  const [betAmount, setBetAmount] = useState(10);
  const [isBetPlaced, setIsBetPlaced] = useState(false);
  const [canCashOut, setCanCashOut] = useState(false);
  const [cashOutMultiplier, setCashOutMultiplier] = useState(0);
  
  // History and stats
  const [multiplierHistory, setMultiplierHistory] = useState<number[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalBets: 0,
    totalWins: 0,
    totalLosses: 0,
    biggestWin: 0,
    currentStreak: 0,
    isWinStreak: true
  });

  // Game engine - memoized to prevent recreation
  const gameEngine = useMemo(() => new GameEngine({
    onMultiplierUpdate: (multiplier: number) => {
      setCurrentMultiplier(Number(multiplier.toFixed(2))); // Round to prevent floating point issues
    },
    onGameStart: () => {
      setIsFlying(true);
      setIsCrashed(false);
      setIsWaitingForNextRound(false);
    },
    onGameCrash: async (finalMultiplier: number) => {
      const roundedMultiplier = Number(finalMultiplier.toFixed(2));
      setCurrentMultiplier(roundedMultiplier);
      setIsFlying(false);
      setIsCrashed(true);
      
      // Add to server and local history
      try {
        const { error } = await supabase
          .from('game_rounds')
          .insert({
            multiplier: roundedMultiplier,
            seed_hash: `seed_${Date.now()}`
          });
        
        if (error) {
          console.error('Error saving game round:', error);
        }
      } catch (error) {
        console.error('Error saving to server:', error);
      }
      
      // Add to local history and maintain only last 20
      setMultiplierHistory(prev => {
        const newHistory = [...prev, roundedMultiplier];
        return newHistory.slice(-20); // Keep only last 20
      });
      
      // Handle bet result if player didn't cash out
      if (isBetPlaced && canCashOut) {
        handleLoss();
      }
      
      // Start next round after delay (10 seconds)
      setTimeout(() => {
        startNextRound();
      }, 10000);
    }
  }), []); // Empty dependency array since callbacks are stable

  // Load recent game history on mount
  useEffect(() => {
    const loadRecentHistory = async () => {
      try {
        const { data, error } = await supabase.rpc('get_recent_game_rounds');
        if (error) throw error;
        
        // Convert to multiplier array and reverse to show most recent last
        const recentMultipliers = data?.map((round: any) => Number(round.multiplier)) || [];
        setMultiplierHistory(recentMultipliers.reverse());
      } catch (error) {
        console.error('Error loading game history:', error);
      }
    };
    
    loadRecentHistory();
    initializeGame();
    startNextRound();
  }, []);

  const startNextRound = useCallback(() => {
    setIsCrashed(false);
    setIsWaitingForNextRound(true);
    setIsBetPlaced(false);
    setCanCashOut(false);
    setCashOutMultiplier(0);
    setCurrentMultiplier(1.0);
    
    // Start game after delay (10 seconds)
    setTimeout(() => {
      gameEngine.startGame();
    }, 10000);
  }, [gameEngine]);

  const placeBet = useCallback(() => {
    if (isFlying || isBetPlaced) {
      return;
    }
    
    if (betAmount > balance) {
      toast({
        variant: "destructive",
        title: "Saldo insuficiente",
        description: `Você precisa de ${betAmount.toFixed(2)} MZN para fazer esta aposta. Saldo atual: ${balance.toFixed(2)} MZN`
      });
      return;
    }
    
    setBalance(prev => prev - betAmount);
    setIsBetPlaced(true);
    setCanCashOut(true);
    
    setGameStats(prev => ({
      ...prev,
      totalBets: prev.totalBets + 1
    }));
    
    toast({
      title: "Aposta realizada!",
      description: `${betAmount.toFixed(2)} MZN apostado`,
    });
  }, [betAmount, balance, isFlying, isBetPlaced, toast]);

  const cashOut = useCallback(() => {
    if (!isFlying || !canCashOut || !isBetPlaced) {
      return;
    }
    
    const payout = calculatePayout(betAmount, currentMultiplier);
    const profit = calculateProfit(betAmount, currentMultiplier);
    
    setBalance(prev => prev + payout);
    setCanCashOut(false);
    setCashOutMultiplier(currentMultiplier);
    
    handleWin(currentMultiplier);
    
    toast({
      title: "Saque bem sucedido!",
      description: `Ganhou ${profit.toFixed(2)} MZN (${currentMultiplier.toFixed(2)}x)`,
    });
  }, [isFlying, canCashOut, isBetPlaced, betAmount, currentMultiplier, toast]);

  const handleWin = useCallback((multiplier: number) => {
    setGameStats(prev => {
      const newStats = {
        ...prev,
        totalWins: prev.totalWins + 1,
        biggestWin: Math.max(prev.biggestWin, multiplier),
        currentStreak: prev.isWinStreak ? prev.currentStreak + 1 : 1,
        isWinStreak: true
      };
      return newStats;
    });
  }, []);

  const handleLoss = useCallback(() => {
    setGameStats(prev => {
      const newStats = {
        ...prev,
        totalLosses: prev.totalLosses + 1,
        currentStreak: !prev.isWinStreak ? prev.currentStreak + 1 : 1,
        isWinStreak: false
      };
      return newStats;
    });
    
    toast({
      title: "Perdeu!",
      description: `Perdeu ${betAmount.toFixed(2)} MZN`,
      variant: "destructive"
    });
  }, [betAmount, toast]);

  return {
    // Game state
    currentMultiplier,
    isFlying,
    isCrashed,
    isWaitingForNextRound,
    
    // Player state
    balance,
    betAmount,
    setBetAmount,
    isBetPlaced,
    canCashOut,
    cashOutMultiplier,
    
    // Actions
    placeBet,
    cashOut,
    
    // History and stats
    multiplierHistory,
    gameStats
  };
};