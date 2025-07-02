interface CurrentScoreProps {
  scores: number[];
  playerNames?: string[];
}

function CurrentScore({ scores, playerNames }: CurrentScoreProps) {
  return (
    <div className="bg-white/80 rounded-lg shadow p-2 px-4 text-sm flex flex-col gap-1">
      <div className="font-bold text-gray-700 mb-1">Scores</div>
      {scores.map((score, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="font-semibold text-gray-800">
            {playerNames ? playerNames[idx] : `Player ${idx + 1}`}:
          </span>
          <span className="text-green-800 font-bold">{score}</span>
        </div>
      ))}
    </div>
  );
}

export default CurrentScore;
