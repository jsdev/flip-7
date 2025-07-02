import { JSX } from 'preact';
import Card, { CardType } from './Card';

export interface DiscardPileProps {
  cards: CardType[]; // The current discard pile (top card is last in array)
  onReshuffle?: () => void; // Optional callback when reshuffling occurs
}

function DiscardPile({ cards, onReshuffle }: DiscardPileProps): JSX.Element {
  const topCard = cards.length > 0 ? cards[cards.length - 1] : null;
  return (
    <div className="flex flex-col items-center mt-4" aria-label="Discard pile" role="region">
      <div className="relative w-20 h-28">
        {/* Show a stack effect for the pile */}
        {cards.length > 1 && (
          <div className="absolute left-1 top-1 w-20 h-28 bg-gray-300 rounded shadow opacity-60" />
        )}
        {topCard ? (
          <Card card={topCard} />
        ) : (
          <div className="w-20 h-28 bg-gray-100 rounded shadow flex items-center justify-center text-gray-400">
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
