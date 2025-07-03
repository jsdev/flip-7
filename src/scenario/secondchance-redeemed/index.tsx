import React from 'react';

export function ScenarioExplanation() {
  return (
    <div className="scenario-explanation">
      <strong>Second Chance Redeemed!</strong>
      <p>
        Your Second Chance card has saved you from busting. The duplicate card is discarded, and you
        may choose to flip again or bank your points.
      </p>
      <ul>
        <li>
          <strong>Flip Again:</strong> Try for a higher score, but risk busting with no safety net.
        </li>
        <li>
          <strong>Bank:</strong> Secure your current points and end your turn for this round.
        </li>
      </ul>
    </div>
  );
}
