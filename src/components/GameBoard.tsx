import { useState } from 'preact/hooks';
import { Deck, CardType } from '../lib/deck';
import InfoPanel from './InfoPanel';
import PlayerHand from './PlayerHand';
import ActionQueue from './ActionQueue';
import Controls from './Controls';

const PLAYER_COUNT = 4;

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
  }));
}

function calcSafeOdds(deck: Deck, playerNumbers: number[]): number {
  const safeNumbers = deck.cards.filter(
    (c) => c.type === 'number' && !playerNumbers.includes(Number(c.value)),
  ).length;
  return safeNumbers / deck.cards.length;
}

interface ActionLogEntry {
  round: number;
  player: number;
  card: CardType;
  result: string;
  odds?: number;
  action?: string;
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

export default function GameBoard() {
  const [deck, setDeck] = useState(() => {
    const d = new Deck();
    d.shuffle();
    return d;
  });
  const [discard, setDiscard] = useState<CardType[]>([]);
  const [players, setPlayers] = useState<Player[]>(createInitialPlayers());
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [round, setRound] = useState(1);
  const [status, setStatus] = useState('Game start!');
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([]);
  const [gameOver, setGameOver] = useState(false);

  // Handler: Flip a card
  function handleFlip() {
    if (gameOver) return;
    const card = deck.deal();
    if (!card) {
      setStatus('Deck is empty!');
      return;
    }
    // Copy state to avoid mutation
    const newPlayers = [...players];
    const player = { ...newPlayers[currentPlayer] };
    let result = '';
    let odds: number | undefined;
    // Calculate odds before drawing
    if (card.type === 'number') {
      odds = calcSafeOdds(
        deck,
        player.numberCards.map((c) => Number(c.value)),
      );
    }
    if (card.type === 'number') {
      // Check for bust (duplicate number)
      if (player.numberCards.some((c) => c.value === card.value)) {
        player.busted = true;
        result = 'bust';
        setStatus(`Busted! Drew another ${card.value}`);
        // Add card to hand for display
        player.numberCards = [...player.numberCards, card];
        // Advance turn after bust
        newPlayers[currentPlayer] = player;
        setPlayers(newPlayers);
        setDiscard([...discard, card]);
        setActionLog([
          ...actionLog,
          {
            round,
            player: currentPlayer,
            card,
            result,
            odds,
            action: 'draw',
          },
        ]);
        advanceTurn(newPlayers);
        return;
      }
      player.numberCards = [...player.numberCards, card];
      result = 'safe';
    } else if (card.type === 'modifier') {
      player.modifiers = [...player.modifiers, card];
      result = 'modifier';
    } else if (card.type === 'action') {
      player.actionCards = [...player.actionCards, card];
      result = 'action';
    }
    newPlayers[currentPlayer] = player;
    setPlayers(newPlayers);
    setDiscard([...discard, card]);
    setStatus(`Flipped: ${card.label || card.value}`);
    setActionLog([
      ...actionLog,
      {
        round,
        player: currentPlayer,
        card,
        result,
        odds,
        action: 'draw',
      },
    ]);
    setDeck(new Deck()); // For now, just reset deck to avoid mutation issues
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
    player.actionCards = [];
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
      const d = new Deck();
      d.shuffle();
      return d;
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

  const player = players[currentPlayer];

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto p-4">
      <InfoPanel
        player={player}
        turn={currentPlayer}
        totalPlayers={players.length}
        status={status}
        round={round}
      />
      <PlayerHand numberCards={player.numberCards} />
      <ActionQueue actionCards={player.actionCards} />
      <Controls
        onFlip={handleFlip}
        onBank={handleBank}
        onNewGame={handleNewGame}
        canFlip={!gameOver}
        canBank={!gameOver}
        isGameOver={gameOver}
      />
    </div>
  );
}
