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
    <div className="bg-gray-900/95 h-full p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-6">
          <button className="text-white bg-gray-700 px-3 py-1 rounded text-sm">
            Apostas
          </button>
          <button className="text-gray-400 text-sm">
            Anterior
          </button>
          <button className="text-gray-400 text-sm">
            Topo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs">
            {players.length}
          </div>
          <span className="text-gray-400 text-sm">{players.length}/6228 Apostas</span>
        </div>
        <div className="text-center">
          <div className="text-white font-bold">{players.reduce((sum, p) => sum + p.win, 0).toFixed(2)}</div>
          <div className="text-gray-400 text-xs">Prémio total MZN</div>
        </div>
      </div>

      {/* Players List */}
      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-4 gap-2 text-gray-400 text-xs py-2 border-b border-gray-700">
          <div>Jogador</div>
          <div className="text-center">Aposta MZN</div>
          <div className="text-center">X</div>
          <div className="text-center">Prémio MZN</div>
        </div>

        {/* Players */}
        {players.map((player) => (
          <div key={player.id} className="grid grid-cols-4 gap-2 items-center py-2 text-sm border-b border-gray-800/50">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{player.avatar}</span>
              <span className="text-white">{player.name}</span>
            </div>
            <div className="text-center text-white">{player.bet.toFixed(2)}</div>
            <div className="text-center text-gray-400">{player.multiplier.toFixed(1)}</div>
            <div className="text-center text-green-400 font-semibold">{player.win.toFixed(2)}</div>
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