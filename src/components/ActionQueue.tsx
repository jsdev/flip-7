import Card from './Card';

interface CardType {
  type: 'number' | 'modifier' | 'action';
  value: number | string;
  label?: string;
}

interface ActionQueueProps {
  actionCards: CardType[];
  onActionUse?: (card: CardType, idx: number) => void;
}

function ActionQueue({ actionCards, onActionUse }: ActionQueueProps) {
  const handleActionUse = (card: CardType, idx: number) => {
    if (onActionUse) onActionUse(card, idx);
  };

  return (
    <div className="flex flex-row items-center mt-2" aria-label="Player's action cards">
      {actionCards.map((card, idx) => (
        <button
          key={idx}
          className="focus:outline-none"
          onClick={handleActionUse.bind(null, card, idx)}
        >
          <Card card={card} />
        </button>
      ))}
    </div>
  );
}

export default ActionQueue;
