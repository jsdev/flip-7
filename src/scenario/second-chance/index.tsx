import React from 'react';

export function ScenarioExplanation() {
  return (
    <div className="scenario-explanation">
      <strong>You were just granted a Second Chance!</strong>
      <p>
        You are a survivor. Do you wish to flip again and press your luck, or take a breather and
        bank your points?
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
