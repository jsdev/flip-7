import { useState } from 'preact/hooks';

interface FlipStackProps {
  onFlip: () => void;
  isCurrent: boolean;
  disabled?: boolean;
  deckCount?: number;
}

function FlipStack({ onFlip, isCurrent, disabled, deckCount = 50 }: FlipStackProps) {
  const [isFlipping, setIsFlipping] = useState(false);

  const handleFlip = () => {
    if (disabled || isFlipping) return;
    setIsFlipping(true);

    const completeFlip = () => {
      setIsFlipping(false);
      onFlip();
    };

    // eslint-disable-next-line no-undef
    setTimeout(completeFlip, 500);
  };

  // Calculate dynamic stacking based on deck count (inspired by your example)
  const getStackOffset = (deckCount: number) => {
    if (deckCount > 80) return 3;
    if (deckCount > 60) return 2.5;
    if (deckCount > 40) return 2;
    if (deckCount > 20) return 1.5;
    return 1;
  };

  return (
    <div className="relative">
      {/* Deck Stack - exact implementation from inspire.txt */}
      <div
        className="deck-stack"
        data-card-count={deckCount}
        style={
          {
            '--card-count': deckCount,
            '--stack-height': `clamp(8px, ${Math.max(deckCount * 0.5, 2)}px, 40px)`,
            '--stack-offset': `clamp(1px, ${Math.max(deckCount * 0.1, 0.5)}px, 3px)`,
          } as React.CSSProperties & Record<string, string | number>
        }
      >
        {/* Stack Layers - exact from inspire.txt */}
        {Array.from({ length: Math.min(Math.max(Math.floor(deckCount / 5), 1), 8) }).map((_, i) => (
          <div
            key={i}
            className="absolute w-24 h-32 bg-yellow-400 border border-yellow-600 rounded-lg shadow-lg"
            style={{
              transform: `translateY(-${i * (deckCount > 80 ? 3 : deckCount > 60 ? 2.5 : deckCount > 40 ? 2 : deckCount > 20 ? 1.5 : 1)}px) translateX(-${i * 0.5}px)`,
              zIndex: 10 - i,
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-12 border-2 border-yellow-200 rounded opacity-50" />
            </div>
          </div>
        ))}

        {/* Main Interactive Card */}
        <button
          className={`
            relative w-24 h-32 flex items-center justify-center rounded-lg border-2 border-yellow-500
            bg-gradient-to-br from-yellow-200 to-yellow-300
            transition-all duration-300 shadow-lg
            ${isCurrent ? 'scale-110 shadow-xl hover:shadow-2xl hover:-translate-y-1' : 'opacity-60'} 
            ${
              disabled
                ? 'pointer-events-none opacity-40 cursor-not-allowed'
                : 'hover:scale-105 cursor-pointer active:scale-95'
            }
          `}
          onClick={() => handleFlip()}
          disabled={disabled || isFlipping}
          aria-label={`Flip a card (${deckCount} cards remaining)`}
          style={{
            zIndex: 15, // Above all stack layers
            transform: `${isCurrent ? 'scale(1.1)' : ''} ${isFlipping ? 'rotateY(180deg)' : ''}`,
            transformStyle: 'preserve-3d',
            perspective: 600,
          }}
        >
          {/* Card Front */}
          <span
            className={`absolute inset-0 flex flex-col items-center justify-center text-yellow-800 select-none transition-transform duration-500 [backface-visibility:hidden] ${isFlipping ? 'rotate-y-180' : ''}`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="text-2xl font-extrabold">Flip 7</div>
            {deckCount > 0 && (
              <div className="text-xs mt-1 bg-yellow-100 px-2 py-0.5 rounded">{deckCount} left</div>
            )}
          </span>

          {/* Card Back */}
          <span
            className={`absolute inset-0 flex items-center justify-center text-yellow-800 select-none transition-transform duration-500 [backface-visibility:hidden] ${isFlipping ? '' : 'rotate-y-180'}`}
            style={{ transform: 'rotateY(180deg)', transformStyle: 'preserve-3d' }}
            aria-hidden="true"
          >
            <svg
              width="48"
              height="64"
              viewBox="0 0 48 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="48" height="64" rx="8" fill="#FDE68A" stroke="#F59E42" strokeWidth="2" />
              <circle cx="24" cy="32" r="12" fill="#F59E42" opacity="0.2" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}

export default FlipStack;
