/**
 * InfoPanel: Shows current player info, score, turn, and status.
 * Props:
 *   - player: { name, score, isActive, isDealer }
 *   - turn: number (current turn index)
 *   - totalPlayers: number
 *   - status: string (e.g. "Your turn", "Waiting", "Busted!", etc)
 *   - round?: number
 */

interface PlayerInfo {
  name: string;
  score: number;
  isActive: boolean;
  isDealer: boolean;
}

interface InfoPanelProps {
  player: PlayerInfo;
  turn: number;
  totalPlayers: number;
  status: string;
  round?: number;
}

function InfoPanel({ player, turn, totalPlayers, status, round }: InfoPanelProps) {
  return (
    <div
      className={`flex flex-col items-center bg-white/80 rounded-lg shadow p-4 mb-4 w-full max-w-sm border-2 ${player.isActive ? 'border-blue-500' : 'border-transparent'}`}
      aria-label="Player info panel"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold text-lg text-gray-900">{player.name}</span>
        {player.isActive && (
          <span className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-0.5">Active</span>
        )}
        {player.isDealer && (
          <span className="text-xs bg-gray-200 text-gray-700 rounded px-2 py-0.5">Dealer</span>
        )}
      </div>
      <div className="flex items-center gap-4 mb-2">
        <span className="text-2xl font-bold text-green-700">{player.score}</span>
        <span className="text-sm text-gray-600">points</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">
          Turn {turn + 1} of {totalPlayers}
        </span>
        {round !== undefined && <span className="text-xs text-gray-500">Round {round}</span>}
      </div>
      <div className="mt-2 text-sm text-gray-700" aria-live="polite">
        {status}
      </div>
    </div>
  );
}

export default InfoPanel;
