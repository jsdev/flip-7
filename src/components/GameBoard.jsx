import { useState } from 'preact/hooks';
import { Deck } from '../lib/deck.js';

/**
 * Main game board component for Flip 7
 * Handles game state, deck, and UI rendering
 */
export default function GameBoard() {
  // Game state hooks
  const [deck, setDeck] = useState(() => {
    const d = new Deck();
    d.shuffle();
    return d;
  });
  const [playerHand, setPlayerHand] = useState([]);
  const [currentTotal, setCurrentTotal] = useState(0);
  const [cardsFlipped, setCardsFlipped] = useState(0);
  const [isBusted, setIsBusted] = useState(false);
  const [message, setMessage] = useState('Flip up to 7 cards without busting!');
  const [gameOver, setGameOver] = useState(false);

  // Helper: Reset game state
  function startGame() {
    const d = new Deck();
    d.shuffle();
    setDeck(d);
    setPlayerHand([]);
    setCurrentTotal(0);
    setCardsFlipped(0);
    setIsBusted(false);
    setMessage('Flip up to 7 cards without busting!');
    setGameOver(false);
  }

  // Helper: Handle flipping a card
  function handleFlip() {
    if (gameOver) return;
    const card = deck.deal();
    if (!card) {
      setMessage('No more cards in the deck.');
      setGameOver(true);
      return;
    }
    const newHand = [...playerHand, card];
    let newTotal = currentTotal + card.value;
    let newCardsFlipped = cardsFlipped + 1;
    // Ace adjustment if bust
    if (newTotal > 21) {
      for (const c of newHand) {
        if (c.rank === 'A' && c.value === 11) {
          c.value = 1;
          newTotal -= 10;
          if (newTotal <= 21) break;
        }
      }
    }
    setPlayerHand(newHand);
    setCurrentTotal(newTotal);
    setCardsFlipped(newCardsFlipped);
    if (newTotal > 21) {
      setIsBusted(true);
      setMessage('You Busted!');
      setGameOver(true);
    } else if (newCardsFlipped === 7) {
      setMessage('You Win!');
      setGameOver(true);
    }
  }

  // Helper: Handle banking
  function handleBank() {
    if (!gameOver && !isBusted) {
      setMessage('You Banked Your Score!');
      setGameOver(true);
    }
  }

  // UI rendering helpers
  function renderCard(card, idx) {
    // Accessible card rendering
    return (
      <div
        key={idx}
        className={`card suit-${card.suit} bg-white text-black rounded shadow p-2 m-1 flex flex-col items-center justify-center w-16 h-24`}
        role="img"
        aria-label={`${card.rank} of ${card.suit}`}
        tabIndex={0}
      >
        <span className="card-rank text-lg font-bold">{card.rank}</span>
        <span className="card-suit text-xl">{getSuitSymbol(card.suit)}</span>
      </div>
    );
  }

  function getSuitSymbol(suit) {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  }

  return (
    <div className="max-w-md mx-auto bg-gray-900 text-white rounded-xl shadow-lg p-6 mt-8 flex flex-col items-center">
      <div className="mb-4 flex flex-col items-center">
        <div id="info-panel" className="mb-2">
          <span id="current-total" className="font-bold">{currentTotal}</span>
          {' / '}
          <span id="cards-flipped">{cardsFlipped}</span>
        </div>
        <div id="player-hand" className="flex flex-row flex-wrap justify-center mb-2">
          {playerHand.map(renderCard)}
        </div>
        <div id="deck-area" className="mb-2">
          <p id="game-message" className={isBusted ? 'text-red-400' : 'text-green-400'}>{message}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          id="flip-btn"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          onClick={handleFlip}
          disabled={gameOver}
        >
          Flip Card
        </button>
        <button
          id="bank-btn"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          onClick={handleBank}
          disabled={gameOver || isBusted}
        >
          Bank
        </button>
        <button
          id="new-game-btn"
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          onClick={startGame}
        >
          New Game
        </button>
      </div>
    </div>
  );
}
