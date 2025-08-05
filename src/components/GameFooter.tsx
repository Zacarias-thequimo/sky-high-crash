import { memo } from 'react';

export const GameFooter = memo(() => {
  return (
    <footer className="bg-secondary/30 border-t border-border/50 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
            <span className="text-success text-sm font-medium">Provably Fair Game</span>
          </div>
          <span className="text-muted-foreground text-xs">|</span>
          <span className="text-muted-foreground text-xs">Jogo verificado e transparente</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground text-xs">Powered by</span>
          <div className="bg-primary/20 border border-primary/30 rounded px-2 py-1">
            <span className="text-primary font-bold text-sm">SPRIBE</span>
          </div>
        </div>
      </div>
    </footer>
  );
});