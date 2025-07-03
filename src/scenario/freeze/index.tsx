import React from 'react';

export function ScenarioExplanation() {
  return (
    <div className="scenario-explanation">
      <strong>Freeze!</strong>
      <p>
        You have been targeted by a Freeze card. Your current hand will be banked and your turn ends
        immediately.
      </p>
      <ul>
        <li>
          <strong>Banked:</strong> Your current hand is scored and added to your total.
        </li>
        <li>
          <strong>Turn ends:</strong> You cannot flip or play further cards this round.
        </li>
      </ul>
    </div>
  );
}
