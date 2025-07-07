/* eslint-disable functional/no-let, functional/no-loop-statements, no-undef, @typescript-eslint/ban-ts-comment */
// @ts-nocheck
// Pure helpers extracted from gameLogic.ts for easier testing and coverage
import { CardType, Player, RoundPlayerData } from '../types.js';
import confetti from 'canvas-confetti';

export function isGameOver(players: readonly Player[]): boolean {
  // Game is over if all players are either banked or busted
  return players.every((p) => p.banked || p.busted);
}

export function getRoundScore(player: Player): number {
  return (
    player.numberCards.reduce((sum, c) => sum + Number(c.value), 0) +
    player.modifiers.reduce(
      (sum, mod) => (typeof mod.value === 'number' ? sum + mod.value : sum),
      0,
    )
  );
}

export function bustPlayer(player: Player, card: CardType): Player {
  // Calculate what the player would have scored if they banked before busting
  const potentialPoints = getFinalScore(player, 0); // Don't include Flip 7 bonus for bust calculation
  return {
    ...player,
    busted: true,
    numberCards: [...player.numberCards, card],
    flipThree: 0,
    bustedRoundPoints: potentialPoints,
  };
}

export function addCardToHand(player: Player, card: CardType): Player {
  return { ...player, numberCards: [...player.numberCards, card] };
}

export function addModifier(player: Player, card: CardType): Player {
  return { ...player, modifiers: [...player.modifiers, card] };
}

export function decrementFlipThree(player: Player): Player {
  return { ...player, flipThree: player.flipThree > 0 ? player.flipThree - 1 : 0 };
}

export function copyPlayers(players: readonly Player[]): readonly Player[] {
  return players.map((p) => ({ ...p }));
}

export function hasFlip7Bonus(numberCards: readonly CardType[]): boolean {
  const uniqueNumbers = new Set(numberCards.map((c) => c.value));
  return numberCards.length === 7 && uniqueNumbers.size === 7;
}

// PATCH bankPlayer to use getFinalScore
export function bankPlayer(player, flip7Bonus = 0) {
  const roundScore = getFinalScore(player, flip7Bonus);
  return {
    ...player,
    score: player.score + roundScore,
    numberCards: [],
    modifiers: [],
    banked: true,
    busted: false,
  };
}

// PATCH applyFlip7Bonus to use getFinalScore
export function applyFlip7Bonus(player: Player, bonusAmount: number): Player {
  return { ...player, score: player.score + bonusAmount };
}

// Calculate round score with modifier cards: X2 first, then additions
export function getFinalScore(player: Player, flip7Bonus: number = 0): number {
  let base = player.numberCards.reduce((sum, c) => sum + Number(c.value), 0);

  // Apply modifiers: first check for X2 multiplier
  const hasMultiplier = player.modifiers.some((m) => m.value === 'X2');
  if (hasMultiplier) {
    base *= 2;
  }

  // Add flip 7 bonus
  base += flip7Bonus;

  // Apply addition modifiers (+2, +4, +6, +8, +10)
  for (const mod of player.modifiers) {
    if (typeof mod.value === 'number') {
      base += mod.value;
    }
  }

  return base;
}

// Helper to determine if the game is over and who the winners are
export function getGameWinners(players: readonly Player[], target: number): readonly string[] {
  const max = Math.max(...players.map((p) => p.score));
  if (max < target) return [];
  return players.filter((p) => p.score === max && max >= target).map((p) => p.name);
}

/**
 * Calculate the odds of busting (drawing a duplicate number card)
 * @param player - Current player with their cards
 * @param remainingDeck - Cards still in deck (to calculate probabilities)
 * @returns Percentage (0-100) chance of busting on next flip
 */
export function getOddsOfBusting(player: Player, remainingDeck: readonly CardType[]): number {
  // If player has Second Chance, they can't bust (until it's used)
  if (player.secondChance) {
    return 0;
  }

  // Get the unique number values the player currently has
  const playerNumbers = new Set(
    player.numberCards.filter((card) => card.type === 'number').map((card) => Number(card.value)),
  );

  // If player has no number cards, they can't bust
  if (playerNumbers.size === 0) {
    return 0;
  }

  // Count cards in deck that would cause a bust (duplicates of player's numbers)
  const bustCards = remainingDeck.filter(
    (card) => card.type === 'number' && playerNumbers.has(Number(card.value)),
  ).length;

  // Calculate percentage
  const totalCards = remainingDeck.length;
  if (totalCards === 0) {
    return 0;
  }

  return Math.round((bustCards / totalCards) * 100);
}

/**
 * Trigger confetti celebration for Flip 7 bonus
 */
/* eslint-disable functional/no-return-void, functional/functional-parameters */
export function celebrateFlip7(enabled: boolean = true): boolean {
  if (!enabled) {
    return false;
  }

  // Fire confetti from multiple points
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: NodeJS.Timeout = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    const particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);

  return true;
}
/* eslint-enable functional/no-return-void, functional/functional-parameters */

/**
 * Move all remaining player cards to discard at round end
 * Only called when round ends (all players banked/busted)
 */
export function discardRemainingCards(
  players: readonly Player[],
  currentDiscard: readonly CardType[],
): readonly CardType[] {
  // Collect all remaining cards from all players using functional approach
  const allRemainingCards = players.flatMap((player) => [
    ...player.numberCards,
    ...player.modifiers,
    ...player.actionCards,
  ]);

  return [...currentDiscard, ...allRemainingCards];
}

/**
 * Get bust odds display string for CLI/UI
 */
export function getBustOddsDisplay(
  player: Player,
  deck: readonly CardType[],
  showOdds: boolean,
): string {
  if (!showOdds) return '';

  const odds = getOddsOfBusting(player, deck);
  if (odds === 0) {
    return player.secondChance ? ' [Second Chance - Safe!]' : ' [No bust risk]';
  }

  return ` [Bust risk: ${odds}%]`;
}

/**
 * Capture round data for all players when a round ends
 */
export function captureRoundData(
  players: readonly Player[],
  eliminatedByFlip7?: ReadonlyArray<{
    readonly playerName: string;
    readonly potentialScore: number;
  }>,
): readonly RoundPlayerData[] {
  return players.map((player) => {
    const eliminatedInfo = eliminatedByFlip7?.find((e) => e.playerName === player.name);

    return {
      name: player.name,
      pointsBanked: player.banked ? getFinalScore(player, 0) : 0,
      pointsLost: player.busted ? player.bustedRoundPoints : eliminatedInfo?.potentialScore || 0,
    };
  });
}
