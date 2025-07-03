import React from 'react';

export function ScenarioExplanation() {
  return (
    <div className="scenario-explanation">
      <strong>Draw Three!</strong>
      <p>
        You must flip three cards in a row. Each card is added to your hand unless you bust or
        trigger a special effect.
      </p>
      <ul>
        <li>
          <strong>Flip:</strong> Draw a card and add it to your hand, unless it causes a bust or
          triggers an action.
        </li>
        <li>
          <strong>Survive all three:</strong> You keep all cards and continue your turn.
        </li>
        <li>
          <strong>Bust:</strong> If you bust, your turn ends immediately.
        </li>
      </ul>
    </div>
  );
}
