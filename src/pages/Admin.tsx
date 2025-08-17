import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, TrendingUp, DollarSign, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  balance: number;
  role: 'admin' | 'user';
  is_active: boolean;
  total_deposited: number;
  total_withdrawn: number;
  total_bet: number;
  total_won: number;
  created_at: string;
}

interface AdminAction {
  id: string;
  action_type: string;
  target_user_id: string;
  amount: number;
  description: string;
  created_at: string;
  admin_id: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusDescription, setBonusDescription] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      navigate('/');
      toast({
        title: 'Acesso negado',
        description: 'Você não tem permissão para acessar esta área.',
        variant: 'destructive'
      });
    }
  }, [user, profile, loading, navigate, toast]);

  // Load users and admin actions
  useEffect(() => {
    if (profile?.role === 'admin') {
      loadUsers();
      loadAdminActions();
    }
  }, [profile]);

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Erro ao carregar usuários',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setUsers(data || []);
    }
  };

  const loadAdminActions = async () => {
    const { data, error } = await supabase
      .from('admin_actions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      toast({
        title: 'Erro ao carregar ações',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setAdminActions(data || []);
    }
  };

  const giveBonus = async () => {
    if (!selectedUserId || !bonusAmount || parseFloat(bonusAmount) <= 0) {
      toast({
        title: 'Dados inválidos',
        description: 'Selecione um usuário e valor válido',
        variant: 'destructive'
      });
      return;
    }

    setLoadingAction(true);

    try {
      const amount = parseFloat(bonusAmount);

      // Update user balance
      const { error: balanceError } = await supabase.rpc('update_user_balance', {
        p_user_id: selectedUserId,
        p_amount: amount,
        p_operation: 'add'
      });

      if (balanceError) throw balanceError;

      // Log admin action
      const { error: actionError } = await supabase
        .from('admin_actions')
        .insert({
          admin_id: user!.id,
          action_type: 'bonus_given',
          target_user_id: selectedUserId,
          amount: amount,
          description: bonusDescription || `Bônus de ${amount} MZN`
        });

      if (actionError) throw actionError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: selectedUserId,
          type: 'bonus',
          amount: amount,
          status: 'completed',
          description: `Bônus administrativo: ${bonusDescription || 'Sem descrição'}`,
          metadata: {
            admin_id: user!.id,
            admin_action: true
          }
        });

      if (transactionError) throw transactionError;

      toast({
        title: 'Bônus concedido!',
        description: `${amount} MZN foi adicionado ao saldo do usuário.`
      });

      // Reset form and reload data
      setSelectedUserId('');
      setBonusAmount('');
      setBonusDescription('');
      loadUsers();
      loadAdminActions();

    } catch (error: any) {
      toast({
        title: 'Erro ao conceder bônus',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setLoadingAction(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: user!.id,
          action_type: currentStatus ? 'user_suspended' : 'user_activated',
          target_user_id: userId,
          description: `Usuário ${currentStatus ? 'suspenso' : 'ativado'}`
        });

      toast({
        title: `Usuário ${currentStatus ? 'suspenso' : 'ativado'}`,
        description: 'Status atualizado com sucesso.'
      });

      loadUsers();
      loadAdminActions();

    } catch (error: any) {
      toast({
        title: 'Erro ao alterar status',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoadingAction(false);
    }
  };

  if (loading || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verificando permissões...</p>
        </div>
      </div>
    );
  }

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const totalBalance = users.reduce((sum, u) => sum + (u.balance || 0), 0);
  const totalDeposited = users.reduce((sum, u) => sum + (u.total_deposited || 0), 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao jogo
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Painel de Administração</h1>
            <p className="text-muted-foreground">Controle e gerencie o SkyCrash</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {activeUsers} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBalance.toFixed(2)} MZN</div>
              <p className="text-xs text-muted-foreground">
                Soma de todos os saldos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Depositado</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDeposited.toFixed(2)} MZN</div>
              <p className="text-xs text-muted-foreground">
                Histórico de depósitos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                {((activeUsers / totalUsers) * 100).toFixed(1)}% do total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="bonus">Conceder Bônus</TabsTrigger>
            <TabsTrigger value="actions">Histórico de Ações</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Usuários</CardTitle>
                <CardDescription>
                  Visualize e gerencie todos os usuários da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Email/Telefone</TableHead>
                        <TableHead>Saldo</TableHead>
                        <TableHead>Depositado</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.full_name || 'Sem nome'}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{user.email}</div>
                              {user.phone && <div className="text-muted-foreground">{user.phone}</div>}
                            </div>
                          </TableCell>
                          <TableCell>{user.balance?.toFixed(2) || '0.00'} MZN</TableCell>
                          <TableCell>{user.total_deposited?.toFixed(2) || '0.00'} MZN</TableCell>
                          <TableCell>
                            <Badge variant={user.is_active ? 'default' : 'destructive'}>
                              {user.is_active ? 'Ativo' : 'Suspenso'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'secondary' : 'outline'}>
                              {user.role === 'admin' ? 'Admin' : 'Usuário'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleUserStatus(user.id, user.is_active)}
                              disabled={loadingAction || user.role === 'admin'}
                            >
                              {user.is_active ? 'Suspender' : 'Ativar'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bonus Tab */}
          <TabsContent value="bonus">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Conceder Bônus
                </CardTitle>
                <CardDescription>
                  Adicione saldo diretamente à conta de um usuário
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Selecionar Usuário</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md bg-background"
                  >
                    <option value="">Escolha um usuário...</option>
                    {users.filter(u => u.role !== 'admin').map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name || user.email} - {user.balance?.toFixed(2) || '0.00'} MZN
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Valor do Bônus (MZN)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={bonusAmount}
                    onChange={(e) => setBonusAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Descrição (Opcional)</label>
                  <Input
                    value={bonusDescription}
                    onChange={(e) => setBonusDescription(e.target.value)}
                    placeholder="Descrição do bônus..."
                  />
                </div>

                <Button
                  onClick={giveBonus}
                  disabled={loadingAction || !selectedUserId || !bonusAmount}
                  className="w-full"
                >
                  {loadingAction ? 'Processando...' : 'Conceder Bônus'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Ações Administrativas</CardTitle>
                <CardDescription>
                  Últimas 50 ações realizadas pelos administradores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Descrição</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminActions.map((action) => (
                        <TableRow key={action.id}>
                          <TableCell>
                            {new Date(action.created_at).toLocaleString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {action.action_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {action.amount ? `${action.amount} MZN` : '-'}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {action.description}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;