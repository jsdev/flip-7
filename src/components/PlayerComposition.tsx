import PlayerHand from './PlayerHand';
import ActionReceiver from './ActionReceiver';
import type { CardType, Player as PlayerType } from '../types';

interface PlayerCompositionProps {
  player: Omit<PlayerType, 'modifiers' | 'actionCards'> & {
    numberCards: ReadonlyArray<CardType>;
  };
  position: 'bottom' | 'right' | 'top' | 'left';
  rotation: number; // degrees
  isCurrent: boolean;
  actionPrompt?: {
    enabled: boolean;
    onReceive: () => void;
    label: string;
  };
}

function PlayerComposition({
  player,
  position,
  rotation,
  isCurrent,
  actionPrompt,
}: PlayerCompositionProps) {
  return (
    <div
      className={`absolute flex flex-col items-center transition-transform duration-500 ${isCurrent ? 'z-10' : 'z-0'}`}
      style={{
        transform: `rotate(${rotation}deg) translate${position === 'left' || position === 'right' ? 'Y' : 'X'}(0)`,
      }}
      aria-label={`Player panel: ${player.name}`}
    >
      <div className={`mb-2 font-bold ${isCurrent ? 'text-blue-700' : 'text-gray-700'}`}>
        {player.name}
      </div>
      <div className="mb-1 text-green-800 font-bold">{player.score} pts</div>
      <PlayerHand numberCards={player.numberCards} secondChance={player.secondChance} />
      {/* Remove Dealer and Busted badges */}
      {player.banked && (
        <span className="text-xs bg-green-200 text-green-800 rounded px-2 py-0.5 mt-1">Banked</span>
      )}
      {actionPrompt && actionPrompt.enabled && (
        <div className="mt-2">
          <ActionReceiver isActive onReceive={actionPrompt.onReceive} label={actionPrompt.label} />
        </div>
      )}
    </div>
  );
}

export default PlayerComposition;
