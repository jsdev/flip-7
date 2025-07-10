import { Player } from '../types';

interface PlayerListProps {
  players: ReadonlyArray<Player>;
  currentPlayerIndex: number;

  onActionTarget?: (_playerIndex: number) => void;
  actionPrompt?: {
    type: 'freeze' | 'flip-three';
    validTargets: number[];
  };
  eliminatedByFlip7?: ReadonlyArray<{
    readonly playerName: string;
    readonly potentialScore: number;
  }>; // Players eliminated by Flip 7 (for strikethrough display)
}

function PlayerRow({
  player,
  isCurrent,
  canReceiveAction,
  onActionTarget,
  isEliminatedByFlip7,
  potentialScore,
}: {
  player: Player;
  isCurrent: boolean;
  canReceiveAction: boolean;
  onActionTarget?: () => void;
  isEliminatedByFlip7?: boolean;
  potentialScore?: number;
}) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActionTarget?.();
    }
  };

  return (
    <div
      className={`
      flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200
      ${isCurrent ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
      ${canReceiveAction ? 'ring-2 ring-yellow-400 cursor-pointer hover:bg-yellow-50' : ''}
    `}
      onClick={canReceiveAction ? onActionTarget : undefined}
      onKeyDown={canReceiveAction ? handleKeyDown : undefined}
      role={canReceiveAction ? 'button' : undefined}
      tabIndex={canReceiveAction ? 0 : undefined}
      aria-label={canReceiveAction ? `Select ${player.name} for action` : undefined}
    >
      {/* Player Name & Status */}
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <div className="flex flex-col">
          <div className={`font-semibold ${isCurrent ? 'text-blue-700' : 'text-gray-900'}`}>
            {player.name}
          </div>
          <div className="flex space-x-2 text-xs">
            {player.banked && (
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">Banked</span>
            )}
            {player.busted && (
              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded">Busted</span>
            )}
            {player.flipThree > 0 && (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                Flip {player.flipThree}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cards Display */}
      <div className="flex items-center space-x-4">
        {/* Number Cards */}
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500 mr-1">Cards:</span>
          {player.numberCards.length === 0 ? (
            <span className="text-gray-400 text-sm">-</span>
          ) : player.numberCards.length <= 5 ? (
            // Show individual cards if 5 or fewer
            <div className="flex space-x-1">
              {player.numberCards.map((card, idx) => (
                <div
                  key={idx}
                  className="w-6 h-8 bg-white border border-gray-300 rounded text-xs flex items-center justify-center font-semibold"
                >
                  {card.value}
                </div>
              ))}
            </div>
          ) : (
            // Show count if more than 5
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
              {player.numberCards.length} cards
            </span>
          )}
        </div>

        {/* Modifiers */}
        {player.modifiers.length > 0 && (
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500 mr-1">Mods:</span>
            <div className="flex space-x-1">
              {player.modifiers.map((mod, idx) => (
                <div
                  key={idx}
                  className="w-6 h-8 bg-blue-100 border border-blue-300 rounded text-xs flex items-center justify-center font-semibold text-blue-800"
                >
                  {mod.value}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Second Chance */}
        {player.secondChance && (
          <div className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-semibold">
            2nd Chance
          </div>
        )}
      </div>

      {/* Score */}
      <div className="text-right min-w-0">
        {isEliminatedByFlip7 ? (
          <div className="space-y-1">
            <div className="font-bold text-lg text-red-500 line-through">{player.score}</div>
            <div className="text-xs text-red-600 font-medium">Would have: {potentialScore}</div>
            <div className="text-xs text-red-500">Eliminated</div>
          </div>
        ) : (
          <div>
            <div className="font-bold text-lg text-green-700">{player.score}</div>
            <div className="text-xs text-gray-500">pts</div>
          </div>
        )}
      </div>

      {/* Action Target Indicator */}
      {canReceiveAction && (
        <div className="ml-2 text-yellow-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

export default function PlayerList({
  players,
  currentPlayerIndex,
  onActionTarget,
  actionPrompt,
  eliminatedByFlip7,
}: PlayerListProps) {
  const createActionHandler = (index: number) => () => onActionTarget?.(index);

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-3">Players</h3>
      {players.map((player, playerIndex) => {
        const eliminatedInfo = eliminatedByFlip7?.find((e) => e.playerName === player.name);
        return (
          <PlayerRow
            key={player.name}
            player={player}
            isCurrent={playerIndex === currentPlayerIndex}
            canReceiveAction={actionPrompt?.validTargets.includes(playerIndex) || false}
            onActionTarget={onActionTarget ? createActionHandler(playerIndex) : undefined}
            isEliminatedByFlip7={!!eliminatedInfo}
            potentialScore={eliminatedInfo?.potentialScore}
          />
        );
      })}
    </div>
  );
}
