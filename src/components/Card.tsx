export interface CardType {
  type: 'number' | 'modifier' | 'action' | 'bonus';
  value: number | string;
  label?: string;
}

interface CardProps {
  card: CardType;
}

function Card({ card }: CardProps) {
  let bg = 'bg-white';
  let text = 'text-black';
  if (card.type === 'modifier') {
    bg = 'bg-blue-200';
    text = 'text-blue-900';
  } else if (card.type === 'action') {
    bg = 'bg-yellow-200';
    text = 'text-yellow-900';
  } else if (card.type === 'bonus') {
    bg = 'bg-green-200';
    text = 'text-green-900';
  }
  return (
    <button
      className={`card flex items-center justify-center rounded shadow w-16 h-24 m-1 text-2xl font-bold ${bg} ${text}`}
      aria-label={card.label || String(card.value)}
    >
      <span>{card.label || card.value}</span>
    </button>
  );
}

export default Card;
