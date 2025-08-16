import { useEffect, useState, memo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BetRow {
  id: string;
  user_id: string;
  amount: number;
  cash_out_multiplier: number | null;
  actual_win: number | null;
  status: 'active' | 'won' | 'lost' | 'cancelled';
}

interface PlayersListProps {
  totalBets: number;
  totalPrize: number;
}

export const PlayersList = memo(({ totalBets, totalPrize }: PlayersListProps) => {
  const [bets, setBets] = useState<BetRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const { data: gm } = await supabase.functions.invoke('game-manager', {
          body: { action: 'get_active_round' }
        });
        const round = (gm as any)?.round;
        if (!round?.id) {
          if (mounted) setBets([]);
          return;
        }
        const { data, error } = await supabase
          .from('bets')
          .select('id,user_id,amount,cash_out_multiplier,actual_win,status')
          .eq('round_id', round.id)
          .order('amount', { ascending: false });
        if (error) throw error;
        if (mounted) setBets(data || []);
      } catch (e) {
        if (mounted) setBets([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const totalWin = bets.reduce((sum, b) => sum + (b.actual_win ?? 0), 0);

  return (
    <div className="bg-card h-full p-2 sm:p-4 text-card-foreground">
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2 sm:space-x-6">
          <button className="text-foreground/90 bg-muted px-2 sm:px-3 py-1 rounded text-xs sm:text-sm">Apostas</button>
          <button className="text-muted-foreground text-xs sm:text-sm">Anterior</button>
          <button className="text-muted-foreground text-xs sm:text-sm">Topo</button>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded-full flex items-center justify-center text-foreground text-xs">
            {loading ? '-' : bets.length}
          </div>
          <span className="text-muted-foreground text-xs sm:text-sm">{bets.length}/ Apostas</span>
        </div>
        <div className="text-center">
          <div className="text-foreground font-bold text-sm sm:text-base">{totalWin.toFixed(2)}</div>
          <div className="text-muted-foreground text-xs">Prémio total MZN</div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-4 gap-1 sm:gap-2 text-muted-foreground text-xs py-2 border-b border-border/50">
          <div>Jogador</div>
          <div className="text-center">Aposta</div>
          <div className="text-center">X</div>
          <div className="text-center">Prémio</div>
        </div>

        {bets.length === 0 && (
          <div className="text-center text-xs sm:text-sm text-muted-foreground py-6">Sem apostas ainda.</div>
        )}

        {bets.map((b) => {
          const masked = `${b.user_id.slice(0, 3)}…`;
          const mult = b.cash_out_multiplier ? b.cash_out_multiplier.toFixed(2) : '-';
          const win = b.actual_win ? b.actual_win.toFixed(2) : '-';
          return (
            <div key={b.id} className="grid grid-cols-4 gap-1 sm:gap-2 items-center py-2 text-xs sm:text-sm border-b border-border/30">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="text-sm sm:text-lg">🎲</span>
                <span className="text-foreground">{masked}</span>
              </div>
              <div className="text-center text-foreground">{b.amount.toFixed(0)}</div>
              <div className="text-center text-muted-foreground">{mult}</div>
              <div className="text-center text-success font-semibold">{win}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-1">
          <span>🛡️</span>
          <span>Provably Fair Game</span>
        </div>
        <div className="text-primary">Powered by SPRIBE</div>
      </div>
    </div>
  );
});
