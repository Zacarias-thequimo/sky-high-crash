import { Construction, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Construction className="h-24 w-24 text-primary animate-pulse" />
              <AlertTriangle className="h-8 w-8 text-yellow-500 absolute -top-2 -right-2" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Site em Manutenção
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Estamos trabalhando para melhorar sua experiência
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">Tempo estimado</span>
            </div>
            <p className="text-muted-foreground">
              O site voltará a funcionar em breve. Agradecemos sua paciência.
            </p>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Estamos implementando melhorias importantes para oferecer:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-left">
              <li>Melhor desempenho</li>
              <li>Novas funcionalidades</li>
              <li>Maior segurança</li>
              <li>Interface aprimorada</li>
            </ul>
          </div>
          
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Se você é administrador, faça login para acessar o painel de controle
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Maintenance;