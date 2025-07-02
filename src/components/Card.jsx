/**
 * Card component for Flip 7
 * Props: card { type: 'number'|'modifier'|'action', value: number|string, label?: string }
 * For now, just show the number or label centered, with color for type
 */
export default function Card({ card }) {
  let bg = 'bg-white';
  let text = 'text-black';
  if (card.type === 'modifier') {
    bg = 'bg-blue-200';
    text = 'text-blue-900';
  } else if (card.type === 'action') {
    bg = 'bg-yellow-200';
    text = 'text-yellow-900';
  }
  return (
    <div
      className={`card flex items-center justify-center rounded shadow w-16 h-24 m-1 text-2xl font-bold ${bg} ${text}`}
      role="img"
      aria-label={card.label || String(card.value)}
      tabIndex={0}
    >
      {/* Placeholder for card face graphic */}
      <span>{card.label || card.value}</span>
    </div>
  );
}
