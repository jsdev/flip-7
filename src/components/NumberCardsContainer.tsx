import { CardType } from '../types';
import CardComponent from './CardComponent';

interface NumberCardsContainerProps {
  cards: CardType[];
  secondChance?: boolean;
}

function NumberCardsContainer({ cards, secondChance = false }: NumberCardsContainerProps) {
  // Sort cards by value in ascending order
  const sortedCards = [...cards].sort((a, b) => {
    const aValue = typeof a.value === 'number' ? a.value : parseInt(String(a.value), 10);
    const bValue = typeof b.value === 'number' ? b.value : parseInt(String(b.value), 10);
    return aValue - bValue;
  });

  // Calculate card position for proper fanning (closer to real card hand)
  const getCardPosition = (index: number, cardCount: number) => {
    if (cardCount === 1) {
      return { angle: 0, translateX: 0 };
    }

    // Calculate fan spread - tighter fan with more overlap
    const maxAngle = Math.min(40, cardCount * 6); // Reduced max angle for tighter fan
    const angleStep = maxAngle / (cardCount - 1);
    const angle = index * angleStep - maxAngle / 2;

    // Calculate horizontal spacing with heavy overlap (like real cards)
    const cardWidth = 80; // w-20 = 80px
    const overlapAmount = cardWidth * 0.85; // 85% overlap (show only 15% of each card)
    const spacing = cardWidth - overlapAmount;
    const totalWidth = cardWidth + (cardCount - 1) * spacing;
    const startX = -totalWidth / 2;
    const translateX = startX + index * spacing;

    return { angle, translateX };
  };

  return (
    <div className="relative flex justify-center w-full" data-testid="number-cards-container">
      {/* Main Cards Fan */}
      <div className="relative" style={{ width: '600px', height: '180px' }}>
        {sortedCards.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm italic">
            No cards
          </div>
        ) : (
          sortedCards.map((card, index) => {
            const { angle, translateX } = getCardPosition(index, sortedCards.length);
            const translateY = Math.abs(angle) * 1.2; // Exact value from inspire.txt

            return (
              <div
                key={index}
                className="absolute w-20 h-28 cursor-pointer hover:scale-110 transition-all duration-300 hover:-translate-y-6 hover:shadow-2xl"
                style={{
                  transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${angle}deg)`,
                  transformOrigin: 'center bottom',
                  left: '50%',
                  bottom: '0',
                  marginLeft: '-40px', // Half card width to center
                  zIndex: index + 1,
                }}
              >
                <CardComponent card={card} className="w-20 h-28 shadow-lg" />
              </div>
            );
          })
        )}
      </div>

      {/* Second Chance Card - positioned below and to the right, partially visible */}
      {secondChance && (
        <div className="absolute -bottom-4 -right-2 z-10">
          <div
            className="w-16 h-24 bg-gradient-to-br from-green-200 to-green-300 border-2 border-green-400 rounded-lg shadow-lg flex items-center justify-center text-xs font-bold text-green-800 overflow-hidden"
            style={{
              transform: 'rotate(15deg)',
              clipPath: 'polygon(0 60%, 100% 60%, 100% 100%, 0 100%)',
            }}
          >
            <div className="text-center leading-tight">
              <div>2nd</div>
              <div>Chance</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NumberCardsContainer;
