import { JSX } from 'preact';

interface PlayerStats {
  name: string;
  score: number;
  roundsWon: number;
  busts: number;
  bustsCaused: number;
  generous: number;
  luckiest: number;
}

interface TallyBoardProps {
  players: PlayerStats[];
  round: number;
  isGameOver: boolean;
  onNextRound: () => void;
}

function getWinners(players: PlayerStats[], key: keyof PlayerStats): string[] {
  const max = Math.max(...players.map((p) => p[key] as number));
  if (max === 0) return [];
  return players.filter((p) => p[key] === max).map((p) => p.name);
}

function TallyBoard({ players, round, isGameOver, onNextRound }: TallyBoardProps): JSX.Element {
  const winner = getWinners(players, 'score');
  const luckiest = getWinners(players, 'luckiest');
  const generous = getWinners(players, 'generous');
  const mostBusts = getWinners(players, 'busts');
  const bustsCaused = getWinners(players, 'bustsCaused');
  const roundsWon = getWinners(players, 'roundsWon');

  return (
    <div
      className="bg-gradient-to-br from-yellow-50 to-blue-50/80 rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-auto border-2 border-blue-200 animate-fade-in"
      aria-live="polite"
    >
      <h2 className="text-2xl font-extrabold mb-6 text-blue-900 text-center tracking-wide drop-shadow">
        {isGameOver ? 'Final Scores' : `Round ${round} Results`}
      </h2>
      <table className="w-full mb-6 border-separate border-spacing-y-2">
        <thead>
          <tr className="text-left text-blue-700 text-lg">
            <th>Player</th>
            <th>Score</th>
            <th>Rounds Won</th>
            <th>Busts</th>
            <th>Busts Caused</th>
            <th>Generous</th>
            <th>Luckiest</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr
              key={p.name}
              className="bg-white/80 hover:bg-blue-100 transition rounded-lg shadow-sm"
            >
              <td className="font-bold text-blue-900 py-1 px-2 rounded-l-lg">{p.name}</td>
              <td className="py-1 px-2">{p.score}</td>
              <td className="py-1 px-2">{p.roundsWon}</td>
              <td className="py-1 px-2">{p.busts}</td>
              <td className="py-1 px-2">{p.bustsCaused}</td>
              <td className="py-1 px-2">{p.generous}</td>
              <td className="py-1 px-2 rounded-r-lg">{p.luckiest}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {winner.length > 0 && (
          <span className="bg-green-200 text-green-900 rounded px-3 py-1 font-semibold shadow">
            Winner: {winner.join(', ')}
          </span>
        )}
        {luckiest.length > 0 && (
          <span className="bg-blue-200 text-blue-900 rounded px-3 py-1 font-semibold shadow">
            Luckiest Flipper: {luckiest.join(', ')}
          </span>
        )}
        {generous.length > 0 && (
          <span className="bg-yellow-200 text-yellow-900 rounded px-3 py-1 font-semibold shadow">
            Most Generous: {generous.join(', ')}
          </span>
        )}
        {mostBusts.length > 0 && (
          <span className="bg-red-200 text-red-900 rounded px-3 py-1 font-semibold shadow">
            Most Busts: {mostBusts.join(', ')}
          </span>
        )}
        {bustsCaused.length > 0 && (
          <span className="bg-purple-200 text-purple-900 rounded px-3 py-1 font-semibold shadow">
            Most Busts Caused: {bustsCaused.join(', ')}
          </span>
        )}
        {roundsWon.length > 0 && (
          <span className="bg-gray-200 text-gray-900 rounded px-3 py-1 font-semibold shadow">
            Most Rounds Won: {roundsWon.join(', ')}
          </span>
        )}
      </div>
      <button
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition text-lg block mx-auto focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={onNextRound}
      >
        {isGameOver ? 'New Game' : 'Start Next Round'}
      </button>
    </div>
  );
}

export default TallyBoard;
