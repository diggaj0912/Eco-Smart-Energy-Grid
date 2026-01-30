import React from 'react';

interface ControlConsoleProps {
  actions: string[];
  onAction: (action: string) => void;
  disabled: boolean;
  mode: string;
}

const ControlConsole: React.FC<ControlConsoleProps> = ({ actions, onAction, disabled, mode }) => {
  // Always ensure we handle the start case
  const displayActions = mode === 'IDLE' && actions.length === 0 ? ['START SYSTEM'] : actions;

  // Helper to map index to Label A, B, C
  const getLabel = (index: number) => {
    if (mode === 'IDLE') return 'INIT';
    return String.fromCharCode(65 + index); // A, B, C...
  };

  return (
    <div className="border-t border-gray-800 pt-6" role="region" aria-label="Operator Controls">
      <h3 className="text-gray-500 text-xs font-mono uppercase mb-4" id="controls-heading">Operator Controls</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-labelledby="controls-heading">
        {displayActions.map((actionText, index) => {
           // Clean up the action text if it extracted "A. Do something"
           const cleanText = actionText.replace(/^[A-C][\.\:\)]\s*/, '');
           const label = getLabel(index);
           
           return (
            <button
              key={index}
              onClick={() => onAction(label === 'INIT' ? 'START' : label)}
              disabled={disabled}
              aria-label={`${label === 'INIT' ? 'Initialize System' : `Option ${label}`}: ${cleanText}`}
              className={`
                relative group overflow-hidden p-4 rounded border text-left transition-all focus:outline-none focus:ring-2 focus:ring-grid-accent focus:border-transparent
                ${disabled ? 'opacity-50 cursor-not-allowed border-gray-800 bg-gray-900' : 'hover:border-grid-accent border-gray-700 bg-grid-800 hover:bg-gray-800'}
              `}
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 font-black text-4xl group-hover:text-grid-accent transition-colors" aria-hidden="true">
                {label}
              </div>
              <div className="flex flex-col h-full justify-between relative z-10">
                <span className={`text-xs font-bold font-mono mb-2 ${disabled ? 'text-gray-600' : 'text-grid-accent'}`}>
                  OPTION {label}
                </span>
                <span className="text-sm font-medium text-gray-200">
                  {cleanText}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-grid-accent w-0 group-hover:w-full transition-all duration-300" aria-hidden="true"></div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(ControlConsole);