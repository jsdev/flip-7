interface BonusCardsContainerProps {
  multiplierCards: number[];
  additionCards: number[];
}

function BonusCardsContainer({ multiplierCards, additionCards }: BonusCardsContainerProps) {
  const hasAnyBonus = multiplierCards.length > 0 || additionCards.length > 0;

  if (!hasAnyBonus) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 mb-2">
      {/* Multiplier Cards */}
      {multiplierCards.map((mult, index) => (
        <div
          key={`mult-${index}`}
          className="w-12 h-16 bg-gradient-to-br from-amber-200 to-amber-300 border-2 border-amber-400 rounded-lg shadow-md flex items-center justify-center text-sm font-bold text-amber-800"
        >
          ×{mult}
        </div>
      ))}

      {/* Addition Cards */}
      {additionCards.map((add, index) => (
        <div
          key={`add-${index}`}
          className="w-12 h-16 bg-gradient-to-br from-purple-200 to-purple-300 border-2 border-purple-400 rounded-lg shadow-md flex items-center justify-center text-sm font-bold text-purple-800"
        >
          +{add}
        </div>
      ))}
    </div>
  );
}

export default BonusCardsContainer;
