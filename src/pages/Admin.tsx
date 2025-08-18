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
import { ArrowLeft, Users, TrendingUp, DollarSign, Gift, Minus, Ban, Shield, Settings, Construction } from 'lucide-react';
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
  const [newAdminUserId, setNewAdminUserId] = useState('');
  const [demoteAdminUserId, setDemoteAdminUserId] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [removeBalanceUserId, setRemoveBalanceUserId] = useState('');
  const [removeBonusUserId, setRemoveBonusUserId] = useState('');
  const [removeBonusAmount, setRemoveBonusAmount] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  // Check if user is admin with server-side verification
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!loading && user) {
        // First check profile role (faster)
        if (profile?.role === 'admin') {
          return;
        }
        
        // If profile doesn't show admin, check server directly
        try {
          const { data: isAdmin, error } = await supabase.rpc('is_admin', { 
            user_id: user.id 
          });
          
          if (error) throw error;
          
          if (!isAdmin) {
            navigate('/');
            toast({
              title: 'Acesso negado',
              description: 'Você não tem permissão para acessar esta área.',
              variant: 'destructive'
            });
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          navigate('/');
          toast({
            title: 'Erro de verificação',
            description: 'Não foi possível verificar suas permissões.',
            variant: 'destructive'
          });
        }
      } else if (!loading && !user) {
        navigate('/');
        toast({
          title: 'Acesso negado', 
          description: 'Você precisa estar logado para acessar esta área.',
          variant: 'destructive'
        });
      }
    };

    checkAdminAccess();
  }, [user, profile, loading, navigate, toast]);

  // Load users and admin actions
  useEffect(() => {
    if (profile?.role === 'admin') {
      loadUsers();
      loadAdminActions();
      loadMaintenanceSettings();
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

  const loadMaintenanceSettings = async () => {
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'maintenance_mode')
      .single();

    if (error) {
      console.error('Error loading maintenance settings:', error);
    } else if (data) {
      const settings = data.setting_value as { enabled: boolean; message: string };
      setMaintenanceMode(settings.enabled);
      setMaintenanceMessage(settings.message);
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
          type: 'deposit',
          amount: amount,
          status: 'completed',
          description: `Bônus administrativo: ${bonusDescription || 'Sem descrição'}`,
          metadata: {
            admin_id: user!.id,
            admin_action: true,
            transaction_type: 'bonus'
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
      await loadUsers();
      await loadAdminActions();

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

      await loadUsers();
      await loadAdminActions();

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

  const promoteToAdmin = async () => {
    if (!newAdminUserId) {
      toast({
        title: 'Dados inválidos',
        description: 'Selecione um usuário para promover',
        variant: 'destructive'
      });
      return;
    }

    setLoadingAction(true);

    try {
      // Update user role to admin
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', newAdminUserId);

      if (error) throw error;

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: user!.id,
          action_type: 'user_promoted_to_admin',
          target_user_id: newAdminUserId,
          description: 'Usuário promovido a administrador'
        });

      toast({
        title: 'Admin criado!',
        description: 'Usuário promovido a administrador com sucesso.'
      });

      // Reset form and reload data
      setNewAdminUserId('');
      await loadUsers();
      await loadAdminActions();

    } catch (error: any) {
      toast({
        title: 'Erro ao promover usuário',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const demoteFromAdmin = async () => {
    if (!demoteAdminUserId) {
      toast({
        title: 'Dados inválidos',
        description: 'Selecione um admin para rebaixar',
        variant: 'destructive'
      });
      return;
    }

    setLoadingAction(true);

    try {
      // Update user role to user
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'user' })
        .eq('id', demoteAdminUserId);

      if (error) throw error;

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: user!.id,
          action_type: 'admin_demoted_to_user',
          target_user_id: demoteAdminUserId,
          description: 'Administrador rebaixado a usuário comum'
        });

      toast({
        title: 'Admin removido!',
        description: 'Administrador foi rebaixado a usuário comum.'
      });

      // Reset form and reload data
      setDemoteAdminUserId('');
      await loadUsers();
      await loadAdminActions();

    } catch (error: any) {
      toast({
        title: 'Erro ao rebaixar administrador',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const removeAllBalance = async () => {
    if (!removeBalanceUserId) {
      toast({
        title: 'Dados inválidos',
        description: 'Selecione um usuário',
        variant: 'destructive'
      });
      return;
    }

    setLoadingAction(true);

    try {
      // Get current balance
      const selectedUser = users.find(u => u.id === removeBalanceUserId);
      if (!selectedUser || selectedUser.balance <= 0) {
        toast({
          title: 'Saldo zerado',
          description: 'Usuário já tem saldo zero',
          variant: 'destructive'
        });
        return;
      }

      const currentBalance = selectedUser.balance;

      // Remove all balance
      const { error: balanceError } = await supabase.rpc('update_user_balance', {
        p_user_id: removeBalanceUserId,
        p_amount: currentBalance,
        p_operation: 'subtract'
      });

      if (balanceError) throw balanceError;

      // Log admin action
      const { error: actionError } = await supabase
        .from('admin_actions')
        .insert({
          admin_id: user!.id,
          action_type: 'balance_removed',
          target_user_id: removeBalanceUserId,
          amount: currentBalance,
          description: `Saldo removido: ${currentBalance} MZN`
        });

      if (actionError) throw actionError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: removeBalanceUserId,
          type: 'withdrawal',
          amount: currentBalance,
          status: 'completed',
          description: 'Remoção administrativa de saldo',
          metadata: {
            admin_id: user!.id,
            admin_action: true,
            transaction_type: 'admin_removal'
          }
        });

      if (transactionError) throw transactionError;

      toast({
        title: 'Saldo removido!',
        description: `${currentBalance} MZN foi removido da conta do usuário.`
      });

      setRemoveBalanceUserId('');
      await loadUsers();
      await loadAdminActions();

    } catch (error: any) {
      toast({
        title: 'Erro ao remover saldo',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const removeBonus = async () => {
    if (!removeBonusUserId || !removeBonusAmount || parseFloat(removeBonusAmount) <= 0) {
      toast({
        title: 'Dados inválidos',
        description: 'Selecione um usuário e valor válido',
        variant: 'destructive'
      });
      return;
    }

    setLoadingAction(true);

    try {
      const amount = parseFloat(removeBonusAmount);
      const selectedUser = users.find(u => u.id === removeBonusUserId);
      
      if (!selectedUser || selectedUser.balance < amount) {
        toast({
          title: 'Saldo insuficiente',
          description: 'Usuário não tem saldo suficiente para remoção',
          variant: 'destructive'
        });
        return;
      }

      // Remove bonus
      const { error: balanceError } = await supabase.rpc('update_user_balance', {
        p_user_id: removeBonusUserId,
        p_amount: amount,
        p_operation: 'subtract'
      });

      if (balanceError) throw balanceError;

      // Log admin action
      const { error: actionError } = await supabase
        .from('admin_actions')
        .insert({
          admin_id: user!.id,
          action_type: 'bonus_removed',
          target_user_id: removeBonusUserId,
          amount: amount,
          description: `Bônus removido: ${amount} MZN`
        });

      if (actionError) throw actionError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: removeBonusUserId,
          type: 'withdrawal',
          amount: amount,
          status: 'completed',
          description: 'Remoção administrativa de bônus',
          metadata: {
            admin_id: user!.id,
            admin_action: true,
            transaction_type: 'bonus_removal'
          }
        });

      if (transactionError) throw transactionError;

      toast({
        title: 'Bônus removido!',
        description: `${amount} MZN foi removido da conta do usuário.`
      });

      setRemoveBonusUserId('');
      setRemoveBonusAmount('');
      await loadUsers();
      await loadAdminActions();

    } catch (error: any) {
      toast({
        title: 'Erro ao remover bônus',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const toggleMaintenanceMode = async () => {
    setLoadingAction(true);

    try {
      const newMode = !maintenanceMode;
      const newSettings = {
        enabled: newMode,
        message: maintenanceMessage || 'O site está temporariamente em manutenção. Voltaremos em breve.'
      };

      const { error } = await supabase
        .from('system_settings')
        .update({ 
          setting_value: newSettings,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'maintenance_mode');

      if (error) throw error;

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: user!.id,
          action_type: newMode ? 'maintenance_enabled' : 'maintenance_disabled',
          description: `Modo de manutenção ${newMode ? 'ativado' : 'desativado'}`
        });

      setMaintenanceMode(newMode);
      
      toast({
        title: `Modo de manutenção ${newMode ? 'ativado' : 'desativado'}`,
        description: newMode ? 'O site agora mostra a página de construção' : 'O site voltou ao normal'
      });

      await loadAdminActions();

    } catch (error: any) {
      toast({
        title: 'Erro ao alterar modo de manutenção',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoadingAction(false);
    }
  };

  if (loading) {
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
            <TabsTrigger value="remove">Remover Saldo</TabsTrigger>
            <TabsTrigger value="admins">Administradores</TabsTrigger>
            <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
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
                              {user.is_active ? 'Ativo' : 'Banido'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'secondary' : 'outline'}>
                              {user.role === 'admin' ? 'Admin' : 'Usuário'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleUserStatus(user.id, user.is_active)}
                                disabled={loadingAction || user.role === 'admin'}
                              >
                                {user.is_active ? (
                                  <>
                                    <Ban className="h-3 w-3 mr-1" />
                                    Banir
                                  </>
                                ) : (
                                  <>
                                    <Shield className="h-3 w-3 mr-1" />
                                    Desbanir
                                  </>
                                )}
                              </Button>
                            </div>
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

          {/* Remove Balance/Bonus Tab */}
          <TabsContent value="remove">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Remove All Balance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Minus className="h-5 w-5" />
                    Remover Todo Saldo
                  </CardTitle>
                  <CardDescription>
                    Remove completamente o saldo de um usuário
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Selecionar Usuário</label>
                    <select
                      value={removeBalanceUserId}
                      onChange={(e) => setRemoveBalanceUserId(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md bg-background"
                    >
                      <option value="">Escolha um usuário...</option>
                      {users.filter(u => u.role !== 'admin' && u.balance > 0).map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name || user.email} - {user.balance?.toFixed(2) || '0.00'} MZN
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <h4 className="font-medium text-red-800 mb-2">⚠️ Ação Irreversível</h4>
                    <p className="text-sm text-red-700">
                      Esta ação removerá completamente o saldo do usuário. Use com extrema cautela.
                    </p>
                  </div>

                  <Button
                    onClick={removeAllBalance}
                    disabled={loadingAction || !removeBalanceUserId}
                    className="w-full"
                    variant="destructive"
                  >
                    {loadingAction ? 'Processando...' : 'Remover Todo Saldo'}
                  </Button>
                </CardContent>
              </Card>

              {/* Remove Specific Bonus */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <Gift className="h-5 w-5" />
                    Remover Bônus
                  </CardTitle>
                  <CardDescription>
                    Remove um valor específico do saldo de um usuário
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Selecionar Usuário</label>
                    <select
                      value={removeBonusUserId}
                      onChange={(e) => setRemoveBonusUserId(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md bg-background"
                    >
                      <option value="">Escolha um usuário...</option>
                      {users.filter(u => u.role !== 'admin' && u.balance > 0).map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name || user.email} - {user.balance?.toFixed(2) || '0.00'} MZN
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Valor a Remover (MZN)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={removeBonusAmount}
                      onChange={(e) => setRemoveBonusAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-md">
                    <h4 className="font-medium text-orange-800 mb-2">⚠️ Atenção</h4>
                    <p className="text-sm text-orange-700">
                      Certifique-se que o usuário tem saldo suficiente antes de remover.
                    </p>
                  </div>

                  <Button
                    onClick={removeBonus}
                    disabled={loadingAction || !removeBonusUserId || !removeBonusAmount}
                    className="w-full"
                    variant="outline"
                  >
                    {loadingAction ? 'Processando...' : 'Remover Bônus'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Add Admin Tab */}
          <TabsContent value="admins">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestão de Administradores
                </CardTitle>
                <CardDescription>
                  Promova um usuário existente para administrador
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Selecionar Usuário</label>
                  <select
                    value={newAdminUserId}
                    onChange={(e) => setNewAdminUserId(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md bg-background"
                  >
                    <option value="">Escolha um usuário para promover...</option>
                    {users.filter(u => u.role !== 'admin').map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name || user.email} - {user.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h4 className="font-medium text-yellow-800 mb-2">⚠️ Atenção</h4>
                  <p className="text-sm text-yellow-700">
                    Ao promover um usuário para administrador, ele terá acesso total ao painel administrativo, 
                    incluindo a capacidade de gerenciar outros usuários e conceder bônus. Esta ação não pode ser desfeita facilmente.
                  </p>
                </div>

                <Button
                  onClick={promoteToAdmin}
                  disabled={loadingAction || !newAdminUserId}
                  className="w-full"
                  variant="destructive"
                >
                  {loadingAction ? 'Processando...' : 'Promover a Admin'}
                </Button>

                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Remover Admin</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Selecionar Admin para Remover</label>
                      <select
                        value={demoteAdminUserId}
                        onChange={(e) => setDemoteAdminUserId(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md bg-background"
                      >
                        <option value="">Escolha um admin para rebaixar...</option>
                        {users.filter(u => u.role === 'admin' && u.id !== user?.id).map((admin) => (
                          <option key={admin.id} value={admin.id}>
                            {admin.full_name || admin.email} - {admin.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                      <h4 className="font-medium text-red-800 mb-2">⚠️ Atenção</h4>
                      <p className="text-sm text-red-700">
                        Ao remover um administrador, ele perderá todos os privilégios administrativos e voltará a ser um usuário comum. 
                        Esta ação pode ser revertida promovendo-o novamente.
                      </p>
                    </div>

                    <Button
                      onClick={demoteFromAdmin}
                      disabled={loadingAction || !demoteAdminUserId}
                      className="w-full"
                      variant="outline"
                    >
                      {loadingAction ? 'Processando...' : 'Remover Admin'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Construction className="h-5 w-5" />
                  Modo de Manutenção
                </CardTitle>
                <CardDescription>
                  Controle se o site exibe a página de construção para todos os usuários
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Status Atual</h3>
                    <p className="text-sm text-muted-foreground">
                      {maintenanceMode ? 'Site em modo de manutenção' : 'Site funcionando normalmente'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className={`h-4 w-4 ${maintenanceMode ? 'text-orange-500' : 'text-green-500'}`} />
                    <span className={`text-sm font-medium ${maintenanceMode ? 'text-orange-600' : 'text-green-600'}`}>
                      {maintenanceMode ? 'Manutenção' : 'Ativo'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Mensagem de Manutenção</label>
                  <Input
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    placeholder="O site está temporariamente em manutenção. Voltaremos em breve."
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Esta mensagem será exibida na página de construção
                  </p>
                </div>

                {maintenanceMode && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-md">
                    <h4 className="font-medium text-orange-800 mb-2">⚠️ Site em Manutenção</h4>
                    <p className="text-sm text-orange-700">
                      Todos os usuários (exceto administradores) verão a página de construção. 
                      Apenas administradores podem acessar o site normalmente.
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t space-y-2">
                  <Button
                    onClick={toggleMaintenanceMode}
                    disabled={loadingAction}
                    className="w-full"
                    variant={maintenanceMode ? "destructive" : "default"}
                  >
                    {loadingAction ? 'Processando...' : (
                      maintenanceMode ? 'Desativar Modo de Manutenção' : 'Ativar Modo de Manutenção'
                    )}
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    {maintenanceMode 
                      ? 'Clique para voltar o site ao funcionamento normal' 
                      : 'Clique para colocar o site em modo de manutenção'
                    }
                  </p>
                </div>
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