import { useState } from 'preact/hooks';

interface FlipStackProps {
  onFlip: () => void;
  isCurrent: boolean;
  disabled?: boolean;
}

function FlipStack({ onFlip, isCurrent, disabled }: FlipStackProps) {
  const [isFlipping, setIsFlipping] = useState(false);

  const handleFlip = () => {
    if (disabled || isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setIsFlipping(false);
      onFlip();
    }, 500); // 500ms matches animation duration
  };

  return (
    <button
      className={`relative aspect-[3/4] min-h-[100px] min-w-[75px] w-24 h-32 flex items-center justify-center rounded-lg shadow-lg bg-yellow-200 transition-transform duration-300 ${isCurrent ? 'scale-110' : 'opacity-60'} ${disabled ? 'pointer-events-none opacity-40' : ''}`}
      onClick={handleFlip}
      disabled={disabled || isFlipping}
      aria-label="Flip a card"
      style={{ maxWidth: 160, maxHeight: 220, perspective: 600 }}
    >
      <span
        className={`absolute inset-0 flex items-center justify-center text-3xl font-extrabold text-yellow-800 select-none transition-transform duration-500 [backface-visibility:hidden] ${isFlipping ? 'rotate-y-180' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        Flip 7
      </span>
      {/* Card back pattern or SVG could go here */}
      <span
        className={`absolute inset-0 flex items-center justify-center text-3xl font-extrabold text-yellow-800 select-none transition-transform duration-500 [backface-visibility:hidden] ${isFlipping ? '' : 'rotate-y-180'}`}
        style={{ transform: 'rotateY(180deg)', transformStyle: 'preserve-3d' }}
        aria-hidden="true"
      >
        {/* Card back or animation effect */}
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
  );
}

export default FlipStack;
