import { memo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

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
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-3xl font-black text-destructive tracking-wider">AVIATOR</h1>
        </div>

        {/* User Info & Balance */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground text-sm">
              {profile?.full_name || user?.phone || 'Usuário'}
            </span>
          </div>
          
          <div className="bg-success/20 border border-success/30 rounded-lg px-4 py-2">
            <div className="text-success font-bold text-lg">
              {(profile?.balance || balance).toFixed(2)} MZN
            </div>
          </div>
          
          <Button
            onClick={signOut}
            variant="outline"
            size="sm"
            className="border-border hover:bg-secondary"
          >
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
});