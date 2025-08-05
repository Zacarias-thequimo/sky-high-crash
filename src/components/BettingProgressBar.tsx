import { memo } from 'react';
import { Progress } from '@/components/ui/progress';

interface BettingProgressBarProps {
  currentBets: number;
  totalBets: number;
}

export const BettingProgressBar = memo(({ currentBets, totalBets }: BettingProgressBarProps) => {
  const percentage = (currentBets / totalBets) * 100;

  return (
    <div className="bg-card/20 border border-border/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-foreground font-medium">Apostas desta rodada</span>
        <span className="text-muted-foreground text-sm">{currentBets}/{totalBets}</span>
      </div>
      
      <Progress 
        value={percentage} 
        className="h-2 bg-secondary"
      />
      
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>0</span>
        <span>{Math.round(percentage)}%</span>
        <span>{totalBets}</span>
      </div>
    </div>
  );
});