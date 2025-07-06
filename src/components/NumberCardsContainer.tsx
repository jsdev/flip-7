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

  // Calculate fan angle for each card
  const fanCards = sortedCards.map((card, index) => {
    const totalCards = sortedCards.length;
    const maxAngle = Math.min(60, totalCards * 12); // Increased spread: Max 60 degrees spread
    const angleStep = totalCards > 1 ? maxAngle / (totalCards - 1) : 0;
    const angle = totalCards > 1 ? index * angleStep - maxAngle / 2 : 0;

    // Calculate position offset for fan effect - increased radius and spread
    const radius = 180; // Increased from 120
    const x = Math.sin((angle * Math.PI) / 180) * radius * 0.5; // Increased from 0.3
    const y = Math.cos((angle * Math.PI) / 180) * radius * 0.15; // Increased from 0.1

    return {
      card,
      angle,
      x,
      y,
      zIndex: index,
    };
  });

  return (
    <div className="relative" data-testid="number-cards-container">
      {/* Main Cards Fan */}
      <div className="flex items-center justify-center h-40 w-full min-w-[600px]">
        {' '}
        {/* Increased height and width */}
        {fanCards.length === 0 ? (
          <div className="text-gray-400 text-sm italic">No cards</div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {fanCards.map(({ card, angle, x, y, zIndex }, index) => (
              <div
                key={index}
                className="absolute"
                style={{
                  transform: `translate(${x}px, ${y}px) rotate(${angle}deg)`,
                  zIndex,
                  transformOrigin: 'center bottom',
                }}
              >
                <CardComponent card={card} className="w-16 h-24" />
              </div>
            ))}
          </div>
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
