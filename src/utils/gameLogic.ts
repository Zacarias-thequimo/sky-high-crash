// Game logic for SkyCrash

export interface GameRound {
  id: string;
  multiplier: number;
  crashed: boolean;
  startTime: number;
  endTime?: number;
}

export interface PlayerBet {
  amount: number;
  cashOutAt?: number;
  profit: number;
  isWin: boolean;
}

// Algoritmo de geração de multiplicadores baseado no fornecido
export function gerarMultiplicadores(lotes: number = 5): number[] {
  const resultados: number[] = [];

  for (let i = 0; i < lotes; i++) {
    // Número aleatório entre 1 e 10
    const jogadas = Math.floor(Math.random() * 10) + 1;

    const lote: number[] = [];

    // Inserir 2 multiplicadores altos (rosa)
    for (let j = 0; j < 2 && j < jogadas; j++) {
      const alto = Number((Math.random() * 90 + 10).toFixed(2)); // 10x a 100x
      lote.push(alto);
    }

    // Inserir o restante com azul/roxo
    for (let j = 0; j < jogadas - 2; j++) {
      const chance = Math.random();
      let valor;

      if (chance < 0.6) {
        // 60% de chance de ser azul (1.00x - 4.99x)
        valor = Number((Math.random() * 3.99 + 1).toFixed(2));
      } else {
        // 40% de chance de ser roxo (5.00x - 9.99x)
        valor = Number((Math.random() * 4.99 + 5).toFixed(2));
      }

      lote.push(valor);
    }

    // Embaralhar o lote para não deixar os rosas previsíveis
    shuffleArray(lote);

    // Adiciona ao resultado final
    resultados.push(...lote);
  }

  return resultados;
}

// Função auxiliar de embaralhamento (Fisher-Yates)
function shuffleArray(array: number[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Pre-generate multipliers for predictable gameplay
let multiplierQueue: number[] = [];
let currentIndex = 0;

export function getNextMultiplier(): number {
  // Regenerate queue if empty or near end
  if (currentIndex >= multiplierQueue.length - 10) {
    multiplierQueue = [...multiplierQueue, ...gerarMultiplicadores(3)];
  }
  
  const multiplier = multiplierQueue[currentIndex];
  currentIndex++;
  return multiplier;
}

// Initialize the queue
export function initializeGame() {
  multiplierQueue = gerarMultiplicadores(5);
  currentIndex = 0;
}

// Game timing constants
export const GAME_CONFIG = {
  PREPARE_TIME: 3000, // 3 seconds to prepare
  MIN_FLIGHT_TIME: 1000, // Minimum 1 second flight
  MULTIPLIER_INCREMENT: 0.01, // How much multiplier increases per tick
  TICK_INTERVAL: 32, // Update every ~32ms (30fps) for smoother animation
};

export class GameEngine {
  private currentMultiplier: number = 1.0;
  private targetMultiplier: number = 1.0;
  private isFlying: boolean = false;
  private gameStartTime: number = 0;
  private callbacks: {
    onMultiplierUpdate?: (multiplier: number) => void;
    onGameStart?: () => void;
    onGameCrash?: (finalMultiplier: number) => void;
  } = {};

  constructor(callbacks: typeof this.callbacks = {}) {
    this.callbacks = callbacks;
  }

  startGame() {
    this.targetMultiplier = getNextMultiplier();
    this.currentMultiplier = 1.0;
    this.isFlying = true;
    this.gameStartTime = Date.now();
    
    this.callbacks.onGameStart?.();
    this.gameLoop();
  }

  private gameLoop() {
    if (!this.isFlying) return;

    const elapsed = Date.now() - this.gameStartTime;
    
    // Calculate multiplier based on elapsed time with optimized formula
    const increment = (elapsed / 1000) * 0.15; // Faster multiplier growth
    this.currentMultiplier = 1.0 + increment;

    this.callbacks.onMultiplierUpdate?.(this.currentMultiplier);

    // Check if we've reached the target multiplier
    if (this.currentMultiplier >= this.targetMultiplier) {
      this.crash();
      return;
    }

    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => this.gameLoop());
  }

  private crash() {
    this.isFlying = false;
    this.currentMultiplier = this.targetMultiplier;
    this.callbacks.onGameCrash?.(this.targetMultiplier);
  }

  getCurrentMultiplier(): number {
    return this.currentMultiplier;
  }

  isGameFlying(): boolean {
    return this.isFlying;
  }

  forceStop() {
    this.isFlying = false;
  }
}

export function calculateProfit(betAmount: number, cashOutMultiplier: number): number {
  return betAmount * cashOutMultiplier - betAmount;
}

export function calculatePayout(betAmount: number, multiplier: number): number {
  return betAmount * multiplier;
}