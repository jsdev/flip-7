import { ComponentChildren } from 'preact';

interface ScenarioExplanationProps {
  children: ComponentChildren;
}

export function ScenarioExplanation({ children }: ScenarioExplanationProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="text-blue-800 text-sm">{children}</div>
    </div>
  );
}
