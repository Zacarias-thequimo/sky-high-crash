import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Wallet, AlertCircle } from 'lucide-react';

interface WithdrawButtonProps {
  balance: number;
  onSuccess?: () => void;
}

export const WithdrawButton = ({ balance, onSuccess }: WithdrawButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    
    if (!withdrawAmount || withdrawAmount < 100) {
      toast({
        variant: "destructive",
        title: "Valor inválido",
        description: "O valor mínimo para levantamento é 100 MZN"
      });
      return;
    }

    if (withdrawAmount > balance) {
      toast({
        variant: "destructive",
        title: "Saldo insuficiente",
        description: "Você não tem saldo suficiente para este levantamento"
      });
      return;
    }

    if (withdrawAmount > 50000) {
      toast({
        variant: "destructive",
        title: "Valor muito alto",
        description: "O valor máximo para levantamento é 50,000 MZN"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('withdraw', {
        body: {
          amount: withdrawAmount,
          phone: phone.trim() || undefined
        }
      });

      if (error) throw error;

      toast({
        title: "Levantamento solicitado",
        description: `Sua solicitação de levantamento de ${withdrawAmount.toFixed(2)} MZN foi processada com sucesso.`
      });

      setAmount('');
      setPhone('');
      setIsOpen(false);
      onSuccess?.();

    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast({
        variant: "destructive",
        title: "Erro no levantamento",
        description: error.message || "Falha ao processar levantamento. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Levantar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Levantamento de Fundos
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Balance Display */}
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <Label className="text-sm text-gray-400">Saldo disponível</Label>
            <div className="text-2xl font-bold text-green-400">
              {balance.toFixed(2)} MZN
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white">
              Valor para levantamento
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="100.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              max={Math.min(balance, 50000)}
              step="0.01"
              className="bg-gray-700 border-gray-600 text-white"
            />
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <AlertCircle className="w-3 h-3" />
              Mínimo: 100 MZN | Máximo: 50,000 MZN
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-400">Valores rápidos</Label>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  disabled={quickAmount > balance}
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 text-xs"
                >
                  {quickAmount}
                </Button>
              ))}
            </div>
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white">
              Telefone (opcional)
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Ex: +258 84 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <div className="text-xs text-gray-400">
              Se não preenchido, será usado o telefone da conta
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleWithdraw}
            disabled={isLoading || !amount || parseFloat(amount) < 100}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            {isLoading ? 'Processando...' : `Levantar ${amount ? parseFloat(amount).toFixed(2) : '0.00'} MZN`}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};