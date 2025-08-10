import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedPhone = phone.trim().startsWith('+') ? phone.trim() : `+258${phone.trim().replace(/\D/g, '')}`;
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          phone: normalizedPhone,
          password,
        });

        if (error) throw error;

        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta ao Aviator",
        });
        
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          phone: normalizedPhone,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique o SMS para confirmar a conta",
        });
      }
    } catch (error: any) {
      const msg = (error?.message?.includes('Phone signups are disabled') || error?.message?.includes('phone_provider_disabled'))
        ? 'As inscrições por telefone estão desativadas no Supabase. Ative o provedor "Phone" em Auth > Providers e habilite "Signups".'
        : error?.message ?? 'Ocorreu um erro. Tente novamente.';
      toast({
        title: "Erro na autenticação",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = isLogin ? 'Entrar | Aviator' : 'Criar conta | Aviator';
    const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const content = isLogin ? 'Faça login com telefone e senha para jogar Aviator.' : 'Crie sua conta com telefone e senha para jogar Aviator.';
    if (meta) {
      meta.content = content;
    } else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = content;
      document.head.appendChild(m);
    }
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const href = window.location.origin + '/auth';
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      link.href = href;
      document.head.appendChild(link);
    } else {
      link.href = href;
    }
  }, [isLogin]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-md md:max-w-lg bg-card text-card-foreground border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold text-primary">
            Aviator
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-foreground">
                  Nome Completo
                </label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  className="mt-1 bg-muted border-border text-foreground"
                  placeholder="Seu nome completo"
                />
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-foreground">
                Telefone
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                 className="mt-1 bg-muted border-border text-foreground"
                placeholder="+25884xxxxxxx"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Senha
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 bg-muted border-border text-foreground"
                placeholder="Sua senha"
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline text-sm"
            >
              {isLogin 
                ? 'Não tem conta? Criar conta' 
                : 'Já tem conta? Fazer login'
              }
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-muted-foreground hover:text-foreground text-sm">
              ← Voltar ao jogo
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Auth;