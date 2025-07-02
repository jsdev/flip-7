import { JSX } from 'preact';

export interface ActionReceiverProps {
  isActive: boolean;
  onReceive: () => void;
  label?: string;
}

function ActionReceiver({ isActive, onReceive, label }: ActionReceiverProps) {
  return (
    <button
      className={`px-3 py-1 rounded bg-yellow-300 text-yellow-900 font-bold shadow transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}
      onClick={onReceive}
      disabled={!isActive}
      aria-label={label ? `${label} action receiver` : 'Action receiver'}
    >
      {label || 'Action'}
    </button>
  );
}

export default ActionReceiver;
