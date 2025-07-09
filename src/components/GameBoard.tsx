import { useState, useCallback, useRef } from 'preact/hooks';
import { generateDeck, shuffleDeck, dealCard } from '../lib/deck';
import { getFinalScore, celebrateFlip7 } from '../lib/gameLogic.helpers';
import { CardType, RoundPlayerData } from '../types';
import PlayerList from './PlayerList';
import FlipStack from './FlipStack';
import DiscardPile from './DiscardPile';
import NumberCardsContainer from './NumberCardsContainer';
import CardShowcase from './CardShowcase';
import RoundHistoryTable from './RoundHistoryTable';
import { ScenarioExplanation as SecondChanceExplanation } from '../scenario/second-chance';
import { ScenarioExplanation as DrawThreeExplanation } from '../scenario/draw-three';
import { ScenarioExplanation as NestedDrawThreeExplanation } from '../scenario/nested-draw-three';
import { ScenarioExplanation as FreezeExplanation } from '../scenario/freeze';
import { ScenarioExplanation as SecondChanceRedeemedExplanation } from '../scenario/secondchance-redeemed';

const PLAYER_COUNT = 4;

interface FlipThreeState {
  originalPlayer: number;
  target: number;
  flipsRemaining: number;
}

interface PendingAction {
  type: 'freeze' | 'flip-three';
  card: CardType;
  validTargets: number[];
  actingPlayer: number;
}

interface ActionContext {
  flipThreeState?: FlipThreeState | null;
  flipsRemaining?: number;
  pendingAction?: PendingAction;
  parent?: ActionContext;
}

interface Player {
  name: string;
  score: number;
  numberCards: CardType[];
  modifiers: CardType[];
  actionCards: CardType[];
  secondChance: boolean;
  busted: boolean;
  banked: boolean;
  isDealer: boolean;
  isActive: boolean;
  flipThree: number;
  bustedRoundPoints: number;
}

function createInitialPlayers(): Player[] {
  return Array.from({ length: PLAYER_COUNT }, (_, i) => ({
    name: `Player ${i + 1}`,
    score: 0,
    numberCards: [],
    modifiers: [],
    actionCards: [],
    secondChance: false,
    busted: false,
    banked: false,
    isDealer: i === 0,
    isActive: i === 0,
    flipThree: 0,
    bustedRoundPoints: 0,
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

// Helper function to capture round data for round history
const captureRoundData = (currentPlayers: Player[]): RoundPlayerData[] =>
  currentPlayers.map((player) => ({
    name: player.name,
    pointsBanked: player.banked ? getFinalScore(player) : 0,
    pointsLost: player.busted ? player.bustedRoundPoints : 0,
  }));

// Add a stack to manage nested action contexts
export default function GameBoard() {
  const [deck, setDeck] = useState(() => {
    const d = generateDeck();
    return shuffleDeck(d, Math.random);
  });
  const [discard, setDiscard] = useState<CardType[]>([]);
  const [players, setPlayers] = useState<Player[]>(createInitialPlayers());
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [round, setRound] = useState(1);
  const [status, setStatus] = useState('Game start!');
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [roundHistory, setRoundHistory] = useState<RoundPlayerData[][]>([]);
  const [eliminatedByFlip7, setEliminatedByFlip7] = useState<
    {
      readonly playerName: string;
      readonly potentialScore: number;
    }[]
  >([]);
  const [currentAction, setCurrentAction] = useState<ActionContext | null>(null); // Top of stack
  const [showCardShowcase, setShowCardShowcase] = useState(false);

  // Add flip guard to prevent double execution
  const flipInProgress = useRef(false);

  // Helper to push a new action context
  function pushActionContext(ctx: ActionContext) {
    setCurrentAction(ctx);
  }
  // Helper to pop and resume previous context
  function popActionContext() {
    setCurrentAction(null);
  }

  // Handler: Flip a card
  const handleFlip = useCallback(() => {
    if (gameOver || (currentAction && currentAction.pendingAction) || flipInProgress.current)
      return;

    flipInProgress.current = true;

    // Ensure flip guard is always reset, even on early returns
    const resetFlipGuard = () => {
      flipInProgress.current = false;
    };

    // Reset flip guard after a short delay to prevent accidental double-clicks
    window.setTimeout(resetFlipGuard, 150);

    const ctx = (currentAction || {}) as ActionContext;
    const isFlipThree = !!ctx.flipThreeState;
    const actingPlayer = isFlipThree ? ctx.flipThreeState!.target : currentPlayer;
    const [card, newDeck] = dealCard(deck);
    if (!card) {
      setStatus('Deck is empty!');
      resetFlipGuard(); // Reset immediately on early return
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
        // Calculate what the player would have scored if they banked before this card
        const potentialScore = getFinalScore({
          ...player,
          numberCards: player.numberCards, // Don't include the busting card
        });
        player.bustedRoundPoints = potentialScore;
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
        resetFlipGuard(); // Reset immediately on early return
        return;
      }
      player.numberCards = [...player.numberCards, card];

      // Check for Flip 7 bonus
      const uniqueNumbers = new Set(player.numberCards.map((c) => c.value));
      if (player.numberCards.length === 7 && uniqueNumbers.size === 7) {
        // Trigger Flip 7 bonus and end the game
        const roundScore = getFinalScore(player, 15); // 15 is the Flip 7 bonus
        player.score += roundScore;
        player.numberCards = [];
        player.modifiers = [];
        player.banked = true;

        // Track eliminated players
        const eliminated = newPlayers
          .filter(
            (p, idx) =>
              idx !== actingPlayer &&
              !p.banked &&
              !p.busted &&
              (p.numberCards.length > 0 || p.modifiers.length > 0),
          )
          .map((p) => ({
            playerName: p.name,
            potentialScore: getFinalScore(p, 0),
          }));

        // Clear all other players' cards (they are eliminated)
        newPlayers.forEach((p, idx) => {
          if (idx !== actingPlayer && !p.banked && !p.busted) {
            p.numberCards = [];
            p.modifiers = [];
          }
        });

        newPlayers[actingPlayer] = player;
        setPlayers(newPlayers);
        setEliminatedByFlip7(eliminated);
        setGameOver(true);
        setStatus(`🎉 ${player.name} achieved FLIP 7! Game over!`);

        // Trigger confetti
        try {
          celebrateFlip7();
        } catch (e) {
          // Ignore confetti errors
        }

        setActionLog([
          ...actionLog,
          {
            round,
            player: actingPlayer,
            card,
            result: 'flip-7-bonus',
            odds,
            action: isFlipThree ? 'flip-three-flip' : 'draw',
            flipThreeStep: isFlipThree ? 4 - (ctx.flipThreeState?.flipsRemaining ?? 0) : undefined,
          },
        ]);
        resetFlipGuard(); // Reset immediately on early return
        return;
      }

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
        resetFlipGuard(); // Reset immediately on early return
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
        resetFlipGuard(); // Reset immediately on early return
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
      if (ctx.flipThreeState && ctx.flipThreeState.flipsRemaining > 1) {
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
      resetFlipGuard(); // Reset immediately on early return
      return;
    }
    setDeck(newDeck);
  }, [currentAction, gameOver, deck, players, currentPlayer, discard, actionLog, round]);

  // Handler: Resolve pending action (Freeze or Flip Three)
  const handleActionTarget = useCallback(
    (targetIdx: number) => {
      if (!currentAction || !currentAction.pendingAction) return;
      const { type, card, actingPlayer } = currentAction.pendingAction;
      const newPlayers = [...players];
      if (type === 'freeze') {
        // Force target to bank using proper scoring
        const roundScore = getFinalScore(newPlayers[targetIdx]);
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
    },
    [currentAction, players, actionLog, round, discard],
  );

  // Helper: Advance to next player's turn
  const advanceTurn = useCallback(
    (updatedPlayers: Player[]) => {
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
        // Round is over! Capture round data
        const currentRoundData = captureRoundData(updatedPlayers);
        setRoundHistory((prev) => [...prev, currentRoundData]);

        // Check if anyone is still in the game (not eliminated by multiple busts)
        const playersStillInGame = updatedPlayers.filter((p) => !p.busted || p.banked);

        if (playersStillInGame.length <= 1) {
          // Game over - only one player left or no one left
          setStatus('Game Over!');
          setGameOver(true);
        } else {
          // Start new round - reset player states but keep scores
          const newRoundPlayers = updatedPlayers.map((player) => ({
            ...player,
            numberCards: [],
            modifiers: [],
            actionCards: [],
            busted: false,
            banked: false,
            isActive: player.isDealer, // Dealer starts next round
            flipThree: 0,
            bustedRoundPoints: 0,
          }));

          setPlayers(newRoundPlayers);
          setCurrentPlayer(newRoundPlayers.findIndex((p) => p.isDealer));
          setRound((prev) => prev + 1);
          setStatus(
            `Round ${round + 1} begins! ${newRoundPlayers.find((p) => p.isDealer)?.name}'s turn`,
          );

          // Reset deck for new round
          setDeck(() => {
            const d = generateDeck();
            return shuffleDeck(d, Math.random);
          });
          setDiscard([]);
        }
        return;
      }
      setCurrentPlayer(next);
      setStatus(`${updatedPlayers[next].name}'s turn`);
    },
    [currentPlayer],
  );

  // Handler: Bank score
  const handleBank = useCallback(() => {
    if (gameOver) return;
    const newPlayers = [...players];
    const player = { ...newPlayers[currentPlayer] };

    // Check for Flip 7 bonus before banking
    const uniqueNumbers = new Set(player.numberCards.map((c) => c.value));
    const hasFlip7 = player.numberCards.length === 7 && uniqueNumbers.size === 7;

    // Calculate round score using proper scoring logic
    const flip7Bonus = hasFlip7 ? 15 : 0;
    const roundScore = getFinalScore(player, flip7Bonus);
    player.score += roundScore;
    player.numberCards = [];
    player.modifiers = [];
    player.banked = true;
    player.busted = false;
    newPlayers[currentPlayer] = player;

    if (hasFlip7) {
      // Flip 7 bonus ends the game immediately
      // Track eliminated players
      const eliminated = newPlayers
        .filter(
          (p, idx) =>
            idx !== currentPlayer &&
            !p.banked &&
            !p.busted &&
            (p.numberCards.length > 0 || p.modifiers.length > 0),
        )
        .map((p) => ({
          playerName: p.name,
          potentialScore: getFinalScore(p, 0),
        }));

      // Clear all other players' cards (they are eliminated)
      newPlayers.forEach((p, idx) => {
        if (idx !== currentPlayer && !p.banked && !p.busted) {
          p.numberCards = [];
          p.modifiers = [];
        }
      });

      setEliminatedByFlip7(eliminated);
      setGameOver(true);
      setStatus(`🎉 ${player.name} achieved FLIP 7! Game over!`);

      // Trigger confetti
      try {
        celebrateFlip7();
      } catch (e) {
        // Ignore confetti errors
      }
    } else {
      setStatus(`${player.name} banked ${roundScore} points!`);
      advanceTurn(newPlayers);
    }

    setPlayers(newPlayers);
    setActionLog([
      ...actionLog,
      {
        round,
        player: currentPlayer,
        card: { type: 'number', value: roundScore, label: String(roundScore) },
        result: hasFlip7 ? 'flip-7-banked' : 'banked',
        action: 'bank',
      },
    ]);
  }, [gameOver, players, currentPlayer, actionLog, round]);

  // Handler: New Game
  const handleNewGame = useCallback(() => {
    setDeck(() => {
      const d = generateDeck();
      return shuffleDeck(d, Math.random);
    });
    setDiscard([]);
    setPlayers(createInitialPlayers());
    setCurrentPlayer(0);
    setRound(1);
    setStatus('New game started!');
    setActionLog([]);
    setGameOver(false);
    setRoundHistory([]);
    setEliminatedByFlip7([]);
  }, []);

  // TODO: Add logic to check for game over and update setGameOver(true)

  // Calculate current round score for BANK button using proper scoring logic
  const currentRoundScore = getFinalScore(players[currentPlayer]);
  const canBank =
    !gameOver &&
    !currentAction?.pendingAction &&
    currentRoundScore > 0 &&
    !players[currentPlayer].busted &&
    !players[currentPlayer].banked;

  // Prepare action prompt for PlayerList
  const actionPrompt = currentAction?.pendingAction
    ? {
        type: currentAction.pendingAction.type,
        validTargets: currentAction.pendingAction.validTargets,
      }
    : undefined;

  return (
    <div
      className="w-screen h-screen bg-gradient-to-br from-green-100 to-blue-100 overflow-hidden relative"
      data-testid="game-board"
    >
      {/* Top Right - Current Scores */}
      <div className="absolute top-8 right-8 z-30 w-80">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <table className="w-full border-collapse rounded-lg overflow-hidden">
            <caption className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-3 text-left">
              Current Scores
            </caption>
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Player
                </th>
                <th className="text-center py-2 px-3 text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Score
                </th>
                <th className="text-center py-2 px-3 text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr
                  key={player.name}
                  className={`border-b border-gray-100 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } ${index === currentPlayer ? 'ring-2 ring-blue-300 bg-blue-50' : ''}`}
                >
                  <td
                    className={`py-2 px-3 text-sm font-medium ${
                      index === currentPlayer ? 'text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {player.name}
                    {index === currentPlayer && (
                      <span className="ml-2 text-xs text-blue-600">●</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center font-bold text-green-700">{player.score}</td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {player.banked && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Banked
                        </span>
                      )}
                      {player.busted && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          Busted
                        </span>
                      )}
                      {!player.banked && !player.busted && (
                        <span className="text-xs text-gray-400">Active</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Left - Player List */}
      <div className="absolute top-8 left-8 z-30 w-96">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <PlayerList
            players={players}
            currentPlayerIndex={currentPlayer}
            onActionTarget={handleActionTarget}
            actionPrompt={actionPrompt}
            eliminatedByFlip7={eliminatedByFlip7}
          />
        </div>

        {/* Round History Table */}
        {roundHistory.length > 0 && (
          <div className="mt-4">
            <RoundHistoryTable
              roundHistory={roundHistory}
              playerNames={players.map((p) => p.name)}
            />
          </div>
        )}
      </div>

      {/* Center - FlipStack and Discard */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="flex items-center space-x-32">
          {/* Discard Pile */}
          <div>
            <DiscardPile cards={discard} />
          </div>

          {/* FlipStack */}
          <div>
            <FlipStack
              onFlip={handleFlip}
              isCurrent={!currentAction?.pendingAction && !gameOver}
              disabled={!!currentAction?.pendingAction || !!gameOver}
              deckCount={deck.length}
            />
          </div>
        </div>
      </div>

      {/* Bottom - Current Player's Cards */}
      <div className="absolute bottom-4 left-0 right-0 z-30 px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 mx-auto max-w-full">
          {/* Player Name & Status */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">{players[currentPlayer].name}</h2>
            <div className="text-sm text-gray-600">Score: {players[currentPlayer].score} pts</div>
          </div>

          {/* Number Cards with fan effect - Give more space */}
          <div className="mb-8 flex justify-center w-full min-h-[180px]">
            <NumberCardsContainer
              cards={players[currentPlayer].numberCards}
              secondChance={players[currentPlayer].secondChance}
            />
          </div>

          {/* Action Controls */}
          <div className="flex items-center justify-center space-x-6">
            {canBank && (
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg shadow-lg text-lg font-bold transition-all duration-200 flex flex-col items-center"
                onClick={handleBank}
              >
                BANK
                <span className="text-sm font-normal mt-1">+{currentRoundScore} pts</span>
              </button>
            )}

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow transition-colors"
              onClick={handleNewGame}
            >
              New Game
            </button>

            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow transition-colors"
              onClick={() => setShowCardShowcase(true)}
            >
              View Cards
            </button>
          </div>
        </div>
      </div>

      {/* Status Message - Top Center */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-30">
        <div
          className="bg-white/90 backdrop-blur-sm rounded-lg shadow px-6 py-3"
          aria-live="polite"
        >
          <span className="text-sm text-gray-700 font-medium">{status}</span>
        </div>
      </div>

      {/* Game Info - Bottom Right */}
      <div className="absolute bottom-8 right-8 z-30">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 text-sm text-gray-600">
          <div>Round: {round}</div>
          <div>Cards left: {deck.length}</div>
          <div>Discard: {discard.length}</div>
          {gameOver && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <div className="font-semibold text-yellow-800">Game Over!</div>
            </div>
          )}
        </div>
      </div>

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

      {/* Card Showcase Dialog */}
      <CardShowcase isOpen={showCardShowcase} onClose={() => setShowCardShowcase(false)} />
    </div>
  );
}
