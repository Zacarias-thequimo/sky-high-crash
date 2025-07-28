import { useState, useEffect, useCallback } from 'react';
import { GameEngine, initializeGame, calculateProfit, calculatePayout } from '@/utils/gameLogic';
import { useToast } from '@/hooks/use-toast';

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
  const [balance, setBalance] = useState(1000); // Starting balance
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

  // Game engine
  const [gameEngine] = useState(() => new GameEngine({
    onMultiplierUpdate: (multiplier: number) => {
      setCurrentMultiplier(multiplier);
    },
    onGameStart: () => {
      setIsFlying(true);
      setIsCrashed(false);
      setIsWaitingForNextRound(false);
    },
    onGameCrash: (finalMultiplier: number) => {
      setCurrentMultiplier(finalMultiplier);
      setIsFlying(false);
      setIsCrashed(true);
      
      // Add to history
      setMultiplierHistory(prev => [...prev, finalMultiplier]);
      
      // Handle bet result if player didn't cash out
      if (isBetPlaced && canCashOut) {
        handleLoss();
      }
      
      // Start next round after delay
      setTimeout(() => {
        startNextRound();
      }, 3000);
    }
  }));

  // Initialize game on mount
  useEffect(() => {
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
    
    // Start game after delay
    setTimeout(() => {
      gameEngine.startGame();
    }, 3000);
  }, [gameEngine]);

  const placeBet = useCallback(() => {
    if (isFlying || isBetPlaced || betAmount > balance) {
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
      title: "Saque realizado!",
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