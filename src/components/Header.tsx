import { memo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DepositButton } from '@/components/DepositButton';
import { WithdrawButton } from '@/components/WithdrawButton';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Shield, Menu } from 'lucide-react';

interface HeaderProps {
  multiplierHistory: number[];
  balance: number;
}

export const Header = memo(({ multiplierHistory, balance }: HeaderProps) => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  
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
    <div className="bg-gray-900/95 border-b border-gray-700 px-2 sm:px-4 md:px-6 py-3 w-full">
      <div className="flex items-center justify-between w-full flex-wrap gap-2">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-red-500">Aviator</h1>
        </div>

        {/* Multiplier History */}
        <div className="flex items-center space-x-1 overflow-hidden">
          <span className="text-gray-400 text-xs sm:text-sm mr-1 sm:mr-2">Últimas:</span>
          <div className="flex space-x-1 overflow-x-auto max-w-[200px] sm:max-w-none">
            {multiplierHistory.slice(-10).map((multiplier, index) => (
              <div
                key={index}
                className={`text-xs font-bold px-1 sm:px-2 py-1 rounded-md min-w-[35px] sm:min-w-[45px] text-center transition-all duration-300 ${
                  getMultiplierColor(multiplier)
                } ${getMultiplierBgColor(multiplier)}`}
              >
                {multiplier.toFixed(2)}x
              </div>
            ))}
          </div>
        </div>

        {/* User Info & Balance */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="text-green-400 font-bold text-sm sm:text-base">
            {(profile?.balance || balance).toFixed(2)} MZN
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <span className="text-gray-300 text-xs sm:text-sm hidden sm:block">
              {profile?.full_name || user?.phone || 'Usuário'}
            </span>
            
            {/* Hamburger Menu */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-200"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-gray-900 border-gray-700">
                <div className="flex flex-col space-y-4 mt-6">
                  <div className="border-b border-gray-700 pb-4 mb-4">
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Menu de Ações</h3>
                    <div className="text-sm text-gray-400">
                      Usuário: <span className="text-gray-200 font-medium">{profile?.full_name || user?.phone || 'Anônimo'}</span>
                    </div>
                  </div>
                  
                  <WithdrawButton 
                    balance={profile?.balance || balance}
                    onSuccess={() => {
                      window.location.reload();
                      setSheetOpen(false);
                    }}
                  />
                  
                  <DepositButton />
                  
                  <Button
                    onClick={() => {
                      refreshProfile();
                      setSheetOpen(false);
                    }}
                    variant="ghost"
                    className="justify-start text-gray-400 hover:text-gray-200"
                  >
                    🔄 Atualizar permissões
                  </Button>
                  
                  {profile?.role === 'admin' && (
                    <Button
                      onClick={() => {
                        navigate('/admin');
                        setSheetOpen(false);
                      }}
                      variant="secondary"
                      className="justify-start flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Admin
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => {
                      signOut();
                      setSheetOpen(false);
                    }}
                    variant="outline"
                    className="justify-start text-gray-300 border-gray-600 hover:bg-gray-700"
                  >
                    Sair
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
});