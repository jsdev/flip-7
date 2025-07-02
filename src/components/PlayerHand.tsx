import Card, { CardType } from './Card';

interface PlayerHandProps {
  numberCards: CardType[];
  onReorder?: (newOrder: CardType[]) => void;
}

function PlayerHand({ numberCards, onReorder }: PlayerHandProps) {
  // For now, just render in order, add to end by default
  return (
    <div className="flex flex-row items-center" aria-label="Player's number cards">
      {numberCards.map((card, idx) => (
        <Card key={idx} card={card} />
      ))}
    </div>
  );
}
export default PlayerHand;
