import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

export const DepositButton = () => {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState<number>(100)
  const [phone, setPhone] = useState<string>('+258')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleDeposit = async () => {
    if (!amount || amount <= 0) {
      toast({ title: 'Valor inválido', description: 'Informe um montante maior que 0', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const normalizedPhone = phone.trim().length > 0 ? (phone.trim().startsWith('+') ? phone.trim() : `+258${phone.trim().replace(/\D/g,'')}`) : undefined
      const { data, error } = await supabase.functions.invoke('gibrapay-deposit', {
        body: { amount, phone: normalizedPhone }
      })

      if (error) throw error

      toast({ title: 'Depósito iniciado', description: 'Pagamento em processamento via GibraPay.' })
      setOpen(false)
    } catch (err: any) {
      toast({ title: 'Falha ao iniciar depósito', description: err.message || 'Tente novamente', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Depositar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fazer Depósito</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Valor (MZN)</label>
            <Input type="number" min={1} value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} />
          </div>
          <div>
            <label className="text-sm font-medium">Telefone (opcional)</label>
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+25884xxxxxxx" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleDeposit} disabled={loading}>
            {loading ? 'Processando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DepositButton
