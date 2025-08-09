import { memo } from 'react';

interface Player {
  id: string;
  name: string;
  avatar: string;
  bet: number;
  multiplier: number;
  win: number;
}

interface PlayersListProps {
  totalBets: number;
  totalPrize: number;
}

export const PlayersList = memo(({ totalBets, totalPrize }: PlayersListProps) => {
  // Dynamic players data with randomized values
  const players: Player[] = [
    { id: '1', name: '7***1', avatar: '❤️', bet: 2872.05, multiplier: 1.5, win: 4308.08 },
    { id: '2', name: '1***2', avatar: '⚪', bet: 2160.69, multiplier: 2.1, win: 4537.45 },
    { id: '3', name: '1***8', avatar: '🟡', bet: 1914.70, multiplier: 1.8, win: 3446.46 },
    { id: '4', name: '2***9', avatar: '⚫', bet: 1470.62, multiplier: 1.2, win: 1764.74 },
    { id: '5', name: 'k***m', avatar: '⚪', bet: 1436.11, multiplier: 3.2, win: 4595.55 },
    { id: '6', name: '3***0', avatar: '🔴', bet: 1340.29, multiplier: 1.1, win: 1474.32 },
    { id: '7', name: '1***2', avatar: '🟡', bet: 1276.47, multiplier: 2.5, win: 3191.18 },
    { id: '8', name: '1***8', avatar: '🟡', bet: 1276.47, multiplier: 1.9, win: 2425.29 },
    { id: '9', name: 'n***u', avatar: '🔴', bet: 1250.01, multiplier: 4.1, win: 5125.04 },
  ];

  return (
    <div className="card-glass h-full p-4 border border-success/10">
      {/* Futuristic Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-4">
          <button className="text-foreground bg-primary/20 border border-primary/30 px-4 py-2 rounded text-sm text-digital text-neon">
            APOSTAS
          </button>
          <button className="text-muted-foreground hover:text-primary text-sm text-digital transition-colors">
            ANTERIOR
          </button>
          <button className="text-muted-foreground hover:text-success text-sm text-digital transition-colors">
            TOPO
          </button>
        </div>
      </div>

      {/* Glassmorphism Stats */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-success/30 to-primary/30 rounded-full flex items-center justify-center text-foreground text-sm font-bold text-digital border border-success/20 shadow-sm shadow-success/20">
            {players.length}
          </div>
          <span className="text-muted-foreground text-sm text-digital">{players.length}/6228 APOSTAS</span>
        </div>
        <div className="text-center">
          <div className="text-foreground font-bold text-number text-neon">{players.reduce((sum, p) => sum + p.win, 0).toFixed(2)}</div>
          <div className="text-muted-foreground text-xs text-digital">PRÉMIO TOTAL MZN</div>
        </div>
      </div>

      {/* Players List */}
      <div className="space-y-1">
        {/* Futuristic Header */}
        <div className="grid grid-cols-4 gap-2 text-muted-foreground text-xs py-3 border-b border-border/30 text-digital">
          <div>JOGADOR</div>
          <div className="text-center">APOSTA MZN</div>
          <div className="text-center">MULT</div>
          <div className="text-center">PRÉMIO MZN</div>
        </div>

        {/* Enhanced Players */}
        {players.map((player, index) => (
          <div key={player.id} className="grid grid-cols-4 gap-2 items-center py-3 text-sm border-b border-border/20 hover:bg-primary/5 transition-all duration-300 group">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-success/40 flex items-center justify-center text-lg border border-primary/20 shadow-sm shadow-primary/20">
                {player.avatar}
              </div>
              <span className="text-foreground text-digital font-medium group-hover:text-primary transition-colors">{player.name}</span>
            </div>
            <div className="text-center text-foreground text-number">{player.bet.toFixed(2)}</div>
            <div className="text-center text-muted-foreground text-digital">{player.multiplier.toFixed(1)}x</div>
            <div className="text-center text-success font-bold text-number text-neon">{player.win.toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* Provably Fair */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <span>🛡️</span>
          <span>Provably Fair Game</span>
        </div>
        <div className="text-blue-400">Powered by SPRIBE</div>
      </div>
    </div>
  );
});