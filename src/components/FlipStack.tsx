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

  // Calculate how many shadow layers to show based on deck count
  const shadowLayers = Math.min(4, Math.max(1, Math.floor(deckCount / 15)));

  return (
    <div className="relative">
      {/* Stack Shadow Layers */}
      {Array.from({ length: shadowLayers }, (_, i) => (
        <div
          key={`shadow-${i}`}
          className="absolute w-24 h-32 rounded-lg bg-yellow-300 border-2 border-yellow-400"
          style={{
            transform: `translate(${2 * (i + 1)}px, ${2 * (i + 1)}px)`,
            zIndex: shadowLayers - i,
            opacity: 0.7 - i * 0.15,
          }}
        />
      ))}

      {/* Main Card */}
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
        onClick={handleFlip}
        disabled={disabled || isFlipping}
        aria-label={`Flip a card (${deckCount} cards remaining)`}
        style={{
          zIndex: shadowLayers + 1,
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
  );
}

export default FlipStack;
