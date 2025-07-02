import Card, { CardType } from './Card';

interface PlayerHandProps {
  numberCards: ReadonlyArray<CardType>;
  secondChance?: boolean;
}

function PlayerHand({ numberCards, secondChance }: PlayerHandProps) {
  return (
    <div className="flex flex-row items-center" aria-label="Player's number cards">
      {numberCards.map((card, idx) => (
        <Card key={idx} card={card} />
      ))}
      {secondChance && (
        <span
          className="ml-2 px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-bold"
          aria-label="Second Chance safety net"
        >
          2nd Chance
        </span>
      )}
    </div>
  );
}
export default PlayerHand;
