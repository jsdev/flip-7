// Shared types for Flip 7 Preact app

export interface GameOptions {
  readonly passingEnabled: boolean; // Whether players can pass during choice points
  readonly defaultFlipCount: number; // Number of flips allowed per turn
  readonly showOddsOfBust: boolean; // Whether to show bust probability to players
}

export interface CardType {
  readonly type: 'number' | 'modifier' | 'action';
  readonly value: number | string;
  readonly label?: string;
}

export interface Player {
  readonly name: string;
  readonly score: number;
  readonly numberCards: ReadonlyArray<CardType>;
  readonly modifiers: ReadonlyArray<CardType>;
  readonly actionCards: ReadonlyArray<CardType>;
  readonly secondChance: boolean;
  readonly busted: boolean;
  readonly banked: boolean;
  readonly isDealer: boolean;
  readonly isActive: boolean;
  readonly flipThree: number; // Number of forced flips remaining (0 if not active)
  readonly bustedRoundPoints: number; // Points player would have scored if they banked instead of busting
}

export interface RoundPlayerData {
  readonly name: string;
  readonly pointsBanked: number; // Points successfully banked this round
  readonly pointsLost: number; // Points lost due to busting (potential points they had)
}

export interface ActionContext {
  readonly pendingAction?: {
    readonly type: 'freeze' | 'flip-three';
    readonly card: CardType;
    readonly actingPlayer: number;
  };
  readonly flipThreeState?: {
    readonly target: number;
    readonly flipsRemaining: number;
  };
  readonly parent?: ActionContext;
}

export interface GameState {
  readonly deck: ReadonlyArray<CardType>;
  readonly discard: ReadonlyArray<CardType>;
  readonly players: ReadonlyArray<Player>;
  readonly currentPlayer: number;
  readonly round: number;
  readonly status: string;
  readonly message?: string;
  readonly actionStack: ReadonlyArray<ActionContext>;
  readonly currentAction: ActionContext | undefined;
  readonly roundOver?: boolean;
  readonly gameOver?: boolean;
  readonly winners?: readonly string[];
  readonly eliminatedByFlip7?: ReadonlyArray<{
    readonly playerName: string;
    readonly potentialScore: number; // What they would have scored if they banked
  }>; // Players eliminated by Flip 7 (for strikethrough display)
  readonly roundHistory: ReadonlyArray<ReadonlyArray<RoundPlayerData>>; // History of all rounds
  readonly options: GameOptions; // Game configuration options
  readonly flipCount: number; // Remaining flips for current player this turn
}
