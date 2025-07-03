import { useState } from 'preact/hooks';
import { generateDeck, shuffleDeck, dealCard } from '../lib/deck';
import { CardType } from '../types';
import PlayerComposition from './PlayerComposition';
import FlipStack from './FlipStack';
import DiscardPile from './DiscardPile';
import Controls from './Controls';
import CurrentScore from './CurrentScore';
import { ScenarioExplanation as SecondChanceExplanation } from '../scenario/second-chance';
import { ScenarioExplanation as DrawThreeExplanation } from '../scenario/draw-three';
import { ScenarioExplanation as NestedDrawThreeExplanation } from '../scenario/nested-draw-three';
import { ScenarioExplanation as FreezeExplanation } from '../scenario/freeze';
import { ScenarioExplanation as SecondChanceRedeemedExplanation } from '../scenario/secondchance-redeemed';

const PLAYER_COUNT = 4;

interface Player {
  name: string;
  score: number;
  numberCards: CardType[];
  modifiers: CardType[];
  secondChance: boolean;
  busted: boolean;
  banked: boolean;
  isDealer: boolean;
  isActive: boolean;
  flipThree: number;
}

function createInitialPlayers(): Player[] {
  return Array.from({ length: PLAYER_COUNT }, (_, i) => ({
    name: `Player ${i + 1}`,
    score: 0,
    numberCards: [],
    modifiers: [],
    secondChance: false,
    busted: false,
    banked: false,
    isDealer: i === 0,
    isActive: i === 0,
    flipThree: 0,
  }));
}

function calcSafeOdds(deck: ReadonlyArray<CardType>, playerNumbers: number[]): number {
  const safeNumbers = deck.filter(
    (c) => c.type === 'number' && !playerNumbers.includes(Number(c.value)),
  ).length;
  return safeNumbers / deck.length;
}

interface ActionLogEntry {
  round: number;
  player: number;
  card: CardType;
  result: string;
  odds?: number;
  action?: string;
  target?: number;
  banked?: number;
  flipThreeStep?: number;
}

function getLuckiestFlipper(actionLog: ActionLogEntry[]): string[] {
  let minOdds = 1;
  let luckiest: string[] = [];
  actionLog.forEach((log) => {
    if (log.action === 'draw' && log.result === 'safe' && log.odds !== undefined) {
      if (log.odds < minOdds) {
        minOdds = log.odds;
        luckiest = [String(log.player)];
      } else if (log.odds === minOdds) {
        if (!luckiest.includes(String(log.player))) luckiest.push(String(log.player));
      }
    }
  });
  return luckiest;
}

// Add a stack to manage nested action contexts
export default function GameBoard() {
  const [deck, setDeck] = useState(() => {
    const d = generateDeck(null);
    return shuffleDeck(d, Math.random, null);
  });
  const [discard, setDiscard] = useState<CardType[]>([]);
  const [players, setPlayers] = useState<Player[]>(createInitialPlayers());
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [round, setRound] = useState(1);
  const [status, setStatus] = useState('Game start!');
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [flipThreeState, setFlipThreeState] = useState<null | {
    originalPlayer: number;
    target: number;
    flipsRemaining: number;
  }>(null);
  const [pendingAction, setPendingAction] = useState<null | {
    type: 'freeze' | 'flip-three';
    card: CardType;
    validTargets: number[];
  }>(null);
  const [actionStack, setActionStack] = useState<any[]>([]); // Stack of action contexts
  const [currentAction, setCurrentAction] = useState<null | any>(null); // Top of stack

  // Helper to push a new action context
  function pushActionContext(ctx: any) {
    setActionStack((stack) => [ctx, ...stack]);
    setCurrentAction(ctx);
  }
  // Helper to pop and resume previous context
  function popActionContext() {
    setActionStack((stack) => {
      const [, ...rest] = stack;
      setCurrentAction(rest[0] || null);
      return rest;
    });
  }

  // Handler: Flip a card
  function handleFlip() {
    if (gameOver || (currentAction && currentAction.pendingAction)) return;
    const ctx = currentAction || {};
    const isFlipThree = !!ctx.flipThreeState;
    const actingPlayer = isFlipThree ? ctx.flipThreeState.target : currentPlayer;
    const [card, newDeck] = dealCard(deck, null);
    if (!card) {
      setStatus('Deck is empty!');
      return;
    }
    const newPlayers = [...players];
    const player = { ...newPlayers[actingPlayer] };
    let result = '';
    let odds: number | undefined;
    if (card.type === 'number') {
      odds = calcSafeOdds(
        deck,
        player.numberCards.map((c) => Number(c.value)),
      );
    }
    if (card.type === 'number') {
      if (player.numberCards.some((c) => c.value === card.value)) {
        player.busted = true;
        result = 'bust';
        setStatus(`Busted! Drew another ${card.value}`);
        player.numberCards = [...player.numberCards, card];
        newPlayers[actingPlayer] = player;
        setPlayers(newPlayers);
        setDiscard([...discard, card]);
        setActionLog([
          ...actionLog,
          {
            round,
            player: actingPlayer,
            card,
            result,
            odds,
            action: isFlipThree ? 'flip-three-flip' : 'draw',
            flipThreeStep: isFlipThree ? 4 - (ctx.flipThreeState?.flipsRemaining ?? 0) : undefined,
          },
        ]);
        // If in Flip Three, pop context and resume previous
        if (isFlipThree) {
          popActionContext();
          setStatus(`${player.name} busted during Flip Three! Returning to previous action.`);
        } else {
          advanceTurn(newPlayers);
        }
        return;
      }
      player.numberCards = [...player.numberCards, card];
      result = 'safe';
    } else if (card.type === 'modifier') {
      player.modifiers = [...player.modifiers, card];
      result = 'modifier';
    } else if (card.type === 'action') {
      if (card.value === 'Freeze' || card.value === 'Flip Three') {
        // Find valid targets (not self, not banked, not busted)
        const validTargets = players
          .map((p, idx) => idx)
          .filter((idx) => idx !== actingPlayer && !players[idx].banked && !players[idx].busted);
        if (validTargets.length === 0) {
          setStatus(`No valid targets for ${card.value}. Discarded.`);
          setDiscard([...discard, card]);
          setActionLog([
            ...actionLog,
            {
              round,
              player: actingPlayer,
              card,
              result: 'no-target',
              action: card.value === 'Freeze' ? 'freeze' : 'flip-three',
            },
          ]);
        } else {
          // Push current context and start new action
          pushActionContext({
            ...ctx,
            flipThreeState: isFlipThree ? ctx.flipThreeState : null,
            flipsRemaining: isFlipThree ? ctx.flipThreeState?.flipsRemaining : undefined,
          });
          setCurrentAction({
            pendingAction: {
              type: card.value === 'Freeze' ? 'freeze' : 'flip-three',
              card,
              validTargets,
              actingPlayer,
            },
            parent: ctx,
          });
          setStatus(`Select a player to ${card.value === 'Freeze' ? 'freeze' : 'flip three'}.`);
        }
        return;
      }
      // Second Chance logic
      if (card.value === 'Second Chance') {
        const newPlayers = [...players];
        newPlayers[actingPlayer] = {
          ...newPlayers[actingPlayer],
          secondChance: true,
        };
        setPlayers(newPlayers);
        setStatus('Second Chance acquired!');
        setDiscard([...discard, card]);
        setActionLog([
          ...actionLog,
          {
            round,
            player: actingPlayer,
            card,
            result: 'second-chance',
            action: 'second-chance',
          },
        ]);
        return;
      }
    }
    newPlayers[actingPlayer] = player;
    setPlayers(newPlayers);
    setDiscard([...discard, card]);
    setStatus(`Flipped: ${card.label || card.value}`);
    setActionLog([
      ...actionLog,
      {
        round,
        player: actingPlayer,
        card,
        result,
        odds,
        action: isFlipThree ? 'flip-three-flip' : 'draw',
        flipThreeStep: isFlipThree ? 4 - (ctx.flipThreeState?.flipsRemaining ?? 0) : undefined,
      },
    ]);
    // If in Flip Three, decrement flipsRemaining or pop context
    if (isFlipThree) {
      if (ctx.flipThreeState?.flipsRemaining > 1) {
        setCurrentAction({
          ...ctx,
          flipThreeState: {
            ...ctx.flipThreeState,
            flipsRemaining: ctx.flipThreeState.flipsRemaining - 1,
          },
        });
      } else {
        popActionContext();
        setStatus(`${player.name} completed Flip Three! Returning to previous action.`);
      }
      return;
    }
    setDeck(newDeck);
  }

  // Handler: Resolve pending action (Freeze or Flip Three)
  function handleActionTarget(targetIdx: number) {
    if (!currentAction || !currentAction.pendingAction) return;
    const { type, card, actingPlayer } = currentAction.pendingAction;
    const newPlayers = [...players];
    if (type === 'freeze') {
      // Force target to bank
      let roundScore = newPlayers[targetIdx].numberCards.reduce(
        (sum, c) => sum + Number(c.value),
        0,
      );
      for (const mod of newPlayers[targetIdx].modifiers) {
        if (typeof mod.value === 'number') roundScore += mod.value;
      }
      newPlayers[targetIdx] = {
        ...newPlayers[targetIdx],
        score: newPlayers[targetIdx].score + roundScore,
        numberCards: [],
        modifiers: [],
        banked: true,
        busted: false,
      };
      setPlayers(newPlayers);
      setStatus(`${newPlayers[targetIdx].name} was frozen and banked ${roundScore} points!`);
      setActionLog([
        ...actionLog,
        {
          round,
          player: actingPlayer,
          card,
          result: 'froze',
          action: 'freeze',
          target: targetIdx,
          banked: roundScore,
        },
      ]);
      setDiscard([...discard, card]);
      popActionContext();
    } else if (type === 'flip-three') {
      setCurrentAction({
        flipThreeState: {
          originalPlayer: actingPlayer,
          target: targetIdx,
          flipsRemaining: 3,
        },
        parent: currentAction,
      });
      setStatus(`${newPlayers[targetIdx].name} must flip three cards!`);
      setActionLog([
        ...actionLog,
        {
          round,
          player: actingPlayer,
          card,
          result: 'flip-three',
          action: 'flip-three',
          target: targetIdx,
        },
      ]);
      setDiscard([...discard, card]);
    }
  }

  // Helper: Advance to next player's turn
  function advanceTurn(updatedPlayers: Player[]) {
    let next = currentPlayer;
    let found = false;
    for (let i = 1; i <= updatedPlayers.length; i++) {
      const idx = (currentPlayer + i) % updatedPlayers.length;
      if (!updatedPlayers[idx].busted && !updatedPlayers[idx].banked) {
        next = idx;
        found = true;
        break;
      }
    }
    if (!found) {
      setStatus('All players finished!');
      setGameOver(true);
      return;
    }
    setCurrentPlayer(next);
    setStatus(`${updatedPlayers[next].name}'s turn`);
  }

  // Handler: Bank score
  function handleBank() {
    if (gameOver) return;
    const newPlayers = [...players];
    const player = { ...newPlayers[currentPlayer] };
    // Calculate round score
    let roundScore = player.numberCards.reduce((sum, c) => sum + Number(c.value), 0);
    // Apply modifiers (additive only for now)
    for (const mod of player.modifiers) {
      if (typeof mod.value === 'number') roundScore += mod.value;
      // TODO: handle X2 and other modifiers
    }
    player.score += roundScore;
    player.numberCards = [];
    player.modifiers = [];
    player.banked = true;
    player.busted = false;
    newPlayers[currentPlayer] = player;
    setPlayers(newPlayers);
    setStatus(`${player.name} banked ${roundScore} points!`);
    setActionLog([
      ...actionLog,
      {
        round,
        player: currentPlayer,
        card: { type: 'number', value: roundScore, label: String(roundScore) },
        result: 'banked',
        action: 'bank',
      },
    ]);
    advanceTurn(newPlayers);
  }

  // Handler: New Game
  function handleNewGame() {
    setDeck(() => {
      const d = generateDeck(null);
      return shuffleDeck(d, Math.random, null);
    });
    setDiscard([]);
    setPlayers(createInitialPlayers());
    setCurrentPlayer(0);
    setRound(1);
    setStatus('New game started!');
    setActionLog([]);
    setGameOver(false);
  }

  // TODO: Add logic to check for game over and update setGameOver(true)

  // Layout positions and rotations for 4 players
  const playerPositions = [
    { position: 'bottom', rotation: 0, className: 'left-1/2 bottom-0 -translate-x-1/2' },
    { position: 'right', rotation: -90, className: 'right-0 top-1/2 -translate-y-1/2' },
    { position: 'top', rotation: -180, className: 'left-1/2 top-0 -translate-x-1/2' },
    { position: 'left', rotation: -270, className: 'left-0 top-1/2 -translate-y-1/2' },
  ];
  const rotatedPlayers = players.map((_, i) => players[(currentPlayer + i) % 4]);
  const playerNames = players.map((p) => p.name);
  const scores = players.map((p) => p.score);
  // Calculate current round score for BANK button
  const currentRoundScore =
    players[currentPlayer].numberCards.reduce((sum, c) => sum + Number(c.value), 0) +
    players[currentPlayer].modifiers.reduce(
      (sum, m) => (typeof m.value === 'number' ? sum + m.value : sum),
      0,
    );
  const canBank =
    !gameOver &&
    !pendingAction &&
    !flipThreeState &&
    currentRoundScore > 0 &&
    !players[currentPlayer].busted &&
    !players[currentPlayer].banked;

  return (
    <div className="fixed inset-0 min-h-screen w-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center overflow-hidden">
      {/* TallyBoard (top left) - show only at end of game or on demand */}
      {/* <div className="fixed top-4 left-4 z-40"><TallyBoard ... /></div> */}
      {/* CurrentScore (top left) */}
      <div className="fixed top-4 left-4 z-30">
        <CurrentScore scores={scores} playerNames={playerNames} />
      </div>
      {/* New Game (top right) */}
      <div className="fixed top-4 right-4 z-30">
        <button className="bg-blue-600 text-white px-4 py-2 rounded shadow" onClick={handleNewGame}>
          New Game
        </button>
      </div>
      {/* InfoPanel (bottom left) */}
      <div className="fixed bottom-4 left-4 z-30">
        <div className="bg-white/80 rounded shadow p-3 min-w-[200px] text-sm" aria-live="polite">
          {status}
        </div>
      </div>
      {/* BANK (bottom right) */}
      <div className="fixed bottom-4 right-4 z-30">
        {canBank && (
          <button
            className="bg-green-600 text-white px-6 py-3 rounded shadow text-lg font-bold flex flex-col items-center"
            onClick={handleBank}
            disabled={!canBank}
            style={{ display: canBank ? undefined : 'none' }}
          >
            BANK
            <span className="text-xs font-normal mt-1">+{currentRoundScore} pts</span>
          </button>
        )}
      </div>
      {/* Discard pile to the left of FlipStack */}
      <div className="absolute left-1/2 top-1/2 -translate-x-[180%] -translate-y-1/2 z-10">
        <DiscardPile cards={discard} />
      </div>
      {/* FlipStack in the center */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <FlipStack
          onFlip={handleFlip}
          isCurrent={!pendingAction && !gameOver && !flipThreeState}
          disabled={!!pendingAction || !!gameOver || !!flipThreeState}
        />
      </div>
      {/* Player panels anchored to each side */}
      {rotatedPlayers.map((p, idx) => (
        <div
          key={idx}
          className={`fixed z-20 ${playerPositions[idx].className}`}
          style={{ pointerEvents: 'none' }}
        >
          <div style={{ pointerEvents: 'auto' }}>
            <PlayerComposition
              player={p}
              position={playerPositions[idx].position as any}
              rotation={playerPositions[idx].rotation}
              isCurrent={idx === 0}
              actionPrompt={
                pendingAction && pendingAction.validTargets.includes((currentPlayer + idx) % 4)
                  ? {
                      enabled: true,
                      onReceive: () => handleActionTarget((currentPlayer + idx) % 4),
                      label: pendingAction.type === 'freeze' ? 'Freeze' : 'Flip 3',
                    }
                  : undefined
              }
            />
          </div>
        </div>
      ))}
      {/* Scenario explanations overlay */}
      {status === 'Second Chance acquired!' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <SecondChanceExplanation />
        </div>
      )}
      {status.includes('must flip three cards') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <DrawThreeExplanation />
        </div>
      )}
      {status.includes('completed Flip Three! Returning to previous action.') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <NestedDrawThreeExplanation />
        </div>
      )}
      {status.includes('was frozen and banked') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <FreezeExplanation />
        </div>
      )}
      {status === 'Second Chance redeemed!' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <SecondChanceRedeemedExplanation />
        </div>
      )}
    </div>
  );
}
