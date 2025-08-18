import { useState, useEffect, useCallback, useMemo } from 'react';
import { GameEngine, initializeGame, calculateProfit, calculatePayout } from '@/utils/gameLogic';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  const [betAmount, setBetAmount] = useState(10);
  const [isBetPlaced, setIsBetPlaced] = useState(false);
  const [canCashOut, setCanCashOut] = useState(false);
  const [cashOutMultiplier, setCashOutMultiplier] = useState(0);
  const [activeBetId, setActiveBetId] = useState<string | null>(null);
  
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

  // Load recent game history and user balance on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load game history
        const { data, error } = await supabase.rpc('get_recent_game_rounds');
        if (error) throw error;
        
        // Convert to multiplier array and reverse to show most recent last
        const recentMultipliers = data?.map((round: any) => Number(round.multiplier)) || [];
        setMultiplierHistory(recentMultipliers.reverse());

        // Load user balance if authenticated
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('balance')
            .eq('id', user.id)
            .single();
          
          if (profileError) {
            console.error('Error loading user balance:', profileError);
          } else {
            setBalance(profile.balance || 0);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
    initializeGame();
    startNextRound();
  }, [user]);

  const startNextRound = useCallback(() => {
    setIsCrashed(false);
    setIsWaitingForNextRound(true);
    setIsBetPlaced(false);
    setCanCashOut(false);
    setCashOutMultiplier(0);
    setActiveBetId(null);
    setCurrentMultiplier(1.0);
    
    // Start game after delay (10 seconds)
    setTimeout(() => {
      gameEngine.startGame();
    }, 10000);
  }, [gameEngine]);

  const placeBet = useCallback(async (amount: number) => {
    if (isFlying || isBetPlaced) {
      return;
    }
    
    if (amount < 1) {
      toast({
        variant: "destructive",
        title: "Valor inválido",
        description: "O valor da aposta deve ser pelo menos 1 MZN"
      });
      return;
    }
    
    if (amount > balance) {
      toast({
        variant: "destructive",
        title: "Saldo insuficiente",
        description: `Você precisa de ${amount.toFixed(2)} MZN para fazer esta aposta. Saldo atual: ${balance.toFixed(2)} MZN`
      });
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Você precisa estar logado para fazer apostas"
      });
      return;
    }

    try {
      // Update local balance immediately for better UX
      setBalance(prev => prev - amount);
      
      // Create a new game round if needed (for simplicity, we'll create one here)
      const { data: activeRound, error: roundError } = await supabase
        .from('game_rounds')
        .select('id')
        .eq('is_active', true)
        .single();

      let roundId = activeRound?.id;
      
      if (!roundId) {
        // Create new round
        const { data: newRound, error: newRoundError } = await supabase
          .from('game_rounds')
          .insert({
            multiplier: 1.0,
            is_active: true,
            seed_hash: `seed_${Date.now()}`
          })
          .select('id')
          .single();
        
        if (newRoundError) throw newRoundError;
        roundId = newRound.id;
      }

      const { data, error } = await supabase.functions.invoke('place-bet', {
        body: { 
          amount: amount,
          round_id: roundId
        }
      });

      if (error) throw error;

      // Update with server response for accuracy (if provided)
      if (typeof data?.new_balance === 'number') {
        setBalance(data.new_balance);
      }
      setBetAmount(amount);
      setIsBetPlaced(true);
      setCanCashOut(true);

      // Keep a reference to the active bet id for reliable cash-out
      if (data?.bet_id) {
        setActiveBetId(data.bet_id);
      } else {
        try {
          const { data: lastBet } = await supabase
            .from('bets')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('placed_at', { ascending: false })
            .limit(1)
            .single();
          if (lastBet?.id) setActiveBetId(lastBet.id);
        } catch (_) { /* ignore */ }
      }
      
      setGameStats(prev => ({
        ...prev,
        totalBets: prev.totalBets + 1
      }));
      
      toast({
        title: "Aposta realizada!",
        description: `${amount.toFixed(2)} MZN apostado`,
      });
    } catch (error: any) {
      console.error('Error placing bet:', error);
      // Revert balance change on error
      setBalance(prev => prev + amount);
      toast({
        variant: "destructive",
        title: "Erro ao apostar",
        description: error.message || "Ocorreu um erro ao processar sua aposta"
      });
    }
  }, [betAmount, balance, isFlying, isBetPlaced, user, toast]);

  const cashOut = useCallback(async () => {
    if (!isFlying || !canCashOut || !isBetPlaced || !user) {
      return;
    }
    
    const payout = calculatePayout(betAmount, currentMultiplier);
    const profit = calculateProfit(betAmount, currentMultiplier);
    
    // Disable cash out immediately to prevent multiple clicks
    setCanCashOut(false);
    
    try {
      // Use stored bet id when available; fallback to latest active bet
      let betIdToCashOut = activeBetId;
      if (!betIdToCashOut) {
        const { data: activeBet, error: betError } = await supabase
          .from('bets')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('placed_at', { ascending: false })
          .limit(1)
          .single();

        if (betError || !activeBet) {
          throw new Error('No active bet found');
        }
        betIdToCashOut = activeBet.id;
      }

      const { data, error } = await supabase.functions.invoke('cash-out', {
        body: { 
          bet_id: betIdToCashOut,
          multiplier: currentMultiplier
        }
      });

      if (error) throw error;

      // Update balance with server response or fallback to local payout
      if (typeof data?.new_balance === 'number') {
        setBalance(data.new_balance);
      } else {
        setBalance(prev => prev + payout);
      }
      setCashOutMultiplier(currentMultiplier);
      
      handleWin(currentMultiplier);
      setIsBetPlaced(false);
      setActiveBetId(null);
      
      toast({
        title: "Saque bem sucedido!",
        description: `Ganhou ${profit.toFixed(2)} MZN (${currentMultiplier.toFixed(2)}x)`,
      });
    } catch (error: any) {
      console.error('Error cashing out:', error);
      // Re-enable cash out on error
      setCanCashOut(true);
      toast({
        variant: "destructive",
        title: "Erro no saque",
        description: error.message || "Ocorreu um erro ao processar seu saque"
      });
    }
  }, [isFlying, canCashOut, isBetPlaced, betAmount, currentMultiplier, user, activeBetId, toast]);

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