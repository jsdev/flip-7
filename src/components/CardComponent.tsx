import { CardType } from '../types';

interface CardProps {
  card: CardType;
  className?: string;
}

export default function Card({ card, className = '' }: CardProps) {
  // Consistent portrait dimensions for all cards (2:3 ratio)
  const baseStyle =
    'w-20 h-28 rounded-lg shadow-lg transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden';

  if (card.type === 'number') {
    return (
      <div className={`${baseStyle} bg-white border-2 border-gray-300 ${className}`}>
        {/* Card type indicator */}
        <div className="absolute top-1 left-1 text-xs text-gray-500 font-semibold">NUM</div>
        <span className="text-2xl font-bold text-gray-800 mb-1">{card.value}</span>
        <div className="text-xs text-gray-600 text-center">POINTS</div>
      </div>
    );
  }

  if (card.type === 'modifier') {
    if (card.value === 'X2') {
      return (
        <div
          className={`${baseStyle} bg-gradient-to-br from-yellow-200 to-orange-300 border-2 border-yellow-600 ${className}`}
        >
          {/* Card type indicator */}
          <div className="absolute top-1 left-1 text-xs text-yellow-800 font-semibold">MOD</div>
          <span className="text-2xl font-bold text-purple-700 mb-1">×2</span>
          <div className="text-xs text-yellow-800 font-semibold">MULTIPLY</div>
        </div>
      );
    }
    return (
      <div
        className={`${baseStyle} bg-gradient-to-br from-yellow-200 to-orange-300 border-2 border-yellow-600 ${className}`}
      >
        {/* Card type indicator */}
        <div className="absolute top-1 left-1 text-xs text-yellow-800 font-semibold">MOD</div>
        <span className="text-2xl font-bold text-red-700 mb-1">+{card.value}</span>
        <div className="text-xs text-yellow-800 font-semibold">ADD</div>
      </div>
    );
  }

  if (card.type === 'action') {
    if (card.value === 'Freeze') {
      return (
        <div
          className={`${baseStyle} bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-blue-700 text-white ${className}`}
        >
          {/* Card type indicator */}
          <div className="absolute top-1 left-1 text-xs text-blue-100 font-semibold">ACT</div>
          <span className="text-2xl mb-1">🧊</span>
          <div className="text-xs font-bold text-center">FREEZE</div>
        </div>
      );
    } else if (card.value === 'Flip Three') {
      return (
        <div
          className={`${baseStyle} bg-gradient-to-br from-orange-400 to-red-500 border-2 border-red-600 text-white ${className}`}
        >
          {/* Card type indicator */}
          <div className="absolute top-1 left-1 text-xs text-orange-100 font-semibold">ACT</div>
          <span className="text-2xl mb-1">🔄</span>
          <div className="text-xs font-bold text-center">FLIP 3</div>
        </div>
      );
    } else if (card.value === 'Second Chance') {
      return (
        <div
          className={`${baseStyle} bg-gradient-to-br from-pink-400 to-red-500 border-2 border-red-600 text-white ${className}`}
        >
          {/* Card type indicator */}
          <div className="absolute top-1 left-1 text-xs text-pink-100 font-semibold">ACT</div>
          <span className="text-2xl mb-1">💖</span>
          <div className="text-xs font-bold text-center">2ND CHANCE</div>
        </div>
      );
    }
  }

  // Fallback
  return (
    <div className={`${baseStyle} bg-gray-200 border-2 border-gray-400 ${className}`}>
      <div className="absolute top-1 left-1 text-xs text-gray-600 font-semibold">???</div>
      <span className="text-sm text-gray-600 text-center">{card.label || card.value}</span>
    </div>
  );
}
