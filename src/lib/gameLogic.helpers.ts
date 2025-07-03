// Pure helpers extracted from gameLogic.ts for easier testing and coverage
import { CardType, Player } from '../types';

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
  return { ...player, busted: true, numberCards: [...player.numberCards, card] };
}

export function addCardToHand(player: Player, card: CardType): Player {
  return { ...player, numberCards: [...player.numberCards, card] };
}

export function addModifier(player: Player, card: CardType): Player {
  return { ...player, modifiers: [...player.modifiers, card] };
}
