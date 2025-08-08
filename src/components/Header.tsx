import { memo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Plane } from 'lucide-react';

interface HeaderProps {
  multiplierHistory: number[];
  balance: number;
}

export const Header = memo(({ multiplierHistory, balance }: HeaderProps) => {
  const { user, profile, signOut } = useAuth();
  
  const getMultiplierColor = (value: number) => {
    if (value >= 1.00 && value <= 2.00) return 'text-multiplier-low';
    if (value >= 3.00 && value <= 9.99) return 'text-multiplier-mid';
    return 'text-multiplier-high';
  };

  const getMultiplierBgColor = (value: number) => {
    if (value >= 1.00 && value <= 2.00) return 'bg-multiplier-low/20';
    if (value >= 3.00 && value <= 9.99) return 'bg-multiplier-mid/20';
    return 'bg-multiplier-high/20';
  };

  return (
    <div className="card-aviator border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo Aviator */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Plane className="h-8 w-8 glow-primary" style={{ color: 'hsl(var(--primary))' }} />
            <h1 className="text-3xl font-black text-digital" style={{ color: 'hsl(var(--action))' }}>
              AVIATOR
            </h1>
          </div>
        </div>

        {/* Multiplier History */}
        <div className="flex items-center space-x-2">
          <span className="text-digital text-sm mr-3" style={{ color: 'hsl(var(--muted-foreground))' }}>ÚLTIMAS:</span>
          <div className="flex space-x-1 overflow-x-auto">
            {multiplierHistory.slice(-10).map((multiplier, index) => (
              <div
                key={index}
                className={`text-xs font-bold px-3 py-2 rounded-lg min-w-[50px] text-center transition-all duration-300 glow-primary text-digital ${
                  getMultiplierColor(multiplier)
                } ${getMultiplierBgColor(multiplier)}`}
                style={{
                  background: `linear-gradient(135deg, hsl(var(--card)), hsl(var(--accent)))`,
                  border: '1px solid hsl(var(--border))'
                }}
              >
                {multiplier.toFixed(2)}x
              </div>
            ))}
          </div>
        </div>

        {/* User Info & Balance */}
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <div className="text-digital text-xl font-black glow-primary" style={{ color: 'hsl(var(--primary))' }}>
              {(profile?.balance || balance).toFixed(2)} MZN
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-digital text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {profile?.full_name || user?.email || 'USUÁRIO'}
            </span>
            <Button
              onClick={signOut}
              variant="outline"
              size="sm"
              className="text-digital border-border hover:bg-accent"
            >
              SAIR
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});