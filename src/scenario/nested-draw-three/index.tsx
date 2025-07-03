import React from 'react';

export function ScenarioExplanation() {
  return (
    <div className="scenario-explanation">
      <strong>Nested Draw Three!</strong>
      <p>
        You have triggered a Draw Three while already resolving another Draw Three. You must
        complete this new set of three flips before returning to the previous sequence.
      </p>
      <ul>
        <li>
          <strong>Flip:</strong> Draw a card and add it to your hand, unless it causes a bust or
          triggers an action.
        </li>
        <li>
          <strong>Complete all flips:</strong> After finishing, you will resume the previous Draw
          Three sequence.
        </li>
        <li>
          <strong>Bust:</strong> If you bust, your turn ends immediately and you forfeit your hand.
        </li>
      </ul>
    </div>
  );
}
