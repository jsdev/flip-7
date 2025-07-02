interface ControlsProps {
  onFlip: () => void;
  onBank: () => void;
  onNewGame: () => void;
  canFlip?: boolean;
  canBank?: boolean;
  isGameOver?: boolean;
}

function Controls({
  onFlip,
  onBank,
  onNewGame,
  canFlip = true,
  canBank = true,
  isGameOver = false,
}: ControlsProps) {
  return (
    <div className="flex gap-4 justify-center mt-4">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded shadow disabled:opacity-50"
        onClick={onFlip}
        disabled={!canFlip || isGameOver}
        aria-label="Flip a card"
      >
        Flip
      </button>
      <button
        className="px-4 py-2 bg-green-600 text-white rounded shadow disabled:opacity-50"
        onClick={onBank}
        disabled={!canBank || isGameOver}
        aria-label="Bank your score"
      >
        Bank
      </button>
      <button
        className="px-4 py-2 bg-gray-500 text-white rounded shadow"
        onClick={onNewGame}
        aria-label="Start a new game"
      >
        New Game
      </button>
    </div>
  );
}

export default Controls;
