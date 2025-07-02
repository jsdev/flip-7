import { JSX } from 'preact';
import Card, { CardType } from './Card';

export interface DiscardPileProps {
  cards: CardType[]; // The current discard pile (top card is last in array)
  onReshuffle?: () => void; // Optional callback when reshuffling occurs
}

function DiscardPile({ cards, onReshuffle }: DiscardPileProps) {
  // Show up to 6 most recent cards, fanned with random rotation/offset
  const showCards = cards.slice(-6);
  return (
    <div className="flex flex-col items-center mt-4" aria-label="Discard pile" role="region">
      <div className="relative w-28 h-32">
        {showCards.map((card, i) => {
          // Random rotation and offset for each card
          const rot = (Math.random() - 0.5) * 20 + (i - showCards.length / 2) * 8;
          const x = (Math.random() - 0.5) * 8 + (i - showCards.length / 2) * 6;
          const y = (Math.random() - 0.5) * 6 + (i - showCards.length / 2) * 2;
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `translate(-50%, -50%) rotate(${rot}deg) translate(${x}px, ${y}px)`,
                zIndex: i,
              }}
            >
              <Card card={card} />
            </div>
          );
        })}
        {cards.length === 0 && (
          <div
            className="absolute left-1/2 top-1/2 w-20 h-28 bg-gray-100 rounded shadow flex items-center justify-center text-gray-400"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            Empty
          </div>
        )}
      </div>
      <div className="text-xs text-gray-600 mt-1" aria-live="polite">
        {cards.length} card{cards.length === 1 ? '' : 's'} in discard
      </div>
      {onReshuffle && (
        <button
          className="mt-2 px-2 py-1 bg-blue-200 text-blue-900 rounded text-xs shadow hover:bg-blue-300"
          onClick={onReshuffle}
          disabled={cards.length === 0}
          aria-label="Reshuffle discard pile into deck"
        >
          Reshuffle
        </button>
      )}
    </div>
  );
}

export default DiscardPile;
