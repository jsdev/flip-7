import { JSX } from 'preact';
import { RoundPlayerData } from '../types';

interface RoundHistoryTableProps {
  roundHistory: ReadonlyArray<ReadonlyArray<RoundPlayerData>>;
  playerNames: ReadonlyArray<string>;
}

export default function RoundHistoryTable({
  roundHistory,
  playerNames,
}: RoundHistoryTableProps): JSX.Element {
  if (roundHistory.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
        <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-3">
          Round History
        </h3>
        <p className="text-gray-500 text-sm">No rounds completed yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
      <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-3">
        Round History
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 font-medium text-gray-700">Round</th>
              {playerNames.map((name) => (
                <th key={name} className="text-center py-2 px-3 font-medium text-gray-700">
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roundHistory.map((roundData, roundIndex) => (
              <tr key={roundIndex} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-3 font-medium text-gray-600">{roundIndex + 1}</td>
                {playerNames.map((playerName) => {
                  const playerData = roundData.find((p) => p.name === playerName);
                  if (!playerData) {
                    return (
                      <td key={playerName} className="text-center py-2 px-3 text-gray-400">
                        -
                      </td>
                    );
                  }

                  const { pointsBanked, pointsLost } = playerData;

                  if (pointsBanked > 0) {
                    // Player banked points
                    return (
                      <td key={playerName} className="text-center py-2 px-3">
                        <span className="text-green-600 font-semibold">+{pointsBanked}</span>
                      </td>
                    );
                  } else if (pointsLost > 0) {
                    // Player lost points (busted or eliminated)
                    return (
                      <td key={playerName} className="text-center py-2 px-3">
                        <span className="text-red-500 line-through font-medium">{pointsLost}</span>
                        <div className="text-xs text-red-400 mt-1">Lost</div>
                      </td>
                    );
                  }
                  // Player had no cards this round
                  return (
                    <td key={playerName} className="text-center py-2 px-3 text-gray-400">
                      0
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span className="text-green-600 font-semibold">+15</span>
            <span>= Banked points</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-red-500 line-through font-medium">12</span>
            <span>= Lost points (busted/eliminated)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
