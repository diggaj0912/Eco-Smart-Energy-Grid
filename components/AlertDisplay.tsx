import React from 'react';
import { LiveAlert } from '../types';
import { AlertTriangle, Zap, Wind, TrendingUp } from 'lucide-react';

interface AlertDisplayProps {
  alert: LiveAlert | null;
}

const AlertDisplay: React.FC<AlertDisplayProps> = ({ alert }) => {
  if (!alert) return null;

  const severityColor = 
    alert.severity === 'High' ? 'border-l-grid-danger bg-red-900/10' : 
    alert.severity === 'Medium' ? 'border-l-grid-warning bg-amber-900/10' : 
    'border-l-grid-success bg-emerald-900/10';

  const textColor = 
    alert.severity === 'High' ? 'text-grid-danger' : 
    alert.severity === 'Medium' ? 'text-grid-warning' : 
    'text-grid-success';

  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('demand')) return <TrendingUp className="w-5 h-5" aria-hidden="true" />;
    if (t.includes('supply')) return <Zap className="w-5 h-5" aria-hidden="true" />;
    if (t.includes('weather')) return <Wind className="w-5 h-5" aria-hidden="true" />;
    return <AlertTriangle className="w-5 h-5" aria-hidden="true" />;
  };

  return (
    <div 
      className={`border-l-4 ${severityColor} bg-grid-800 rounded-r-lg p-6 mb-6 shadow-xl transition-all duration-300`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className={`p-2 rounded bg-grid-900 ${textColor}`}>
            {getIcon(alert.type)}
          </span>
          <div>
            <h3 className={`font-bold text-lg tracking-tight ${textColor}`}>LIVE ALERT: {alert.type.toUpperCase()}</h3>
            <span className="text-xs text-gray-500 font-mono">
               <span className="sr-only">Timestamp: </span>{alert.timestamp} <span aria-hidden="true">|</span> <span className="sr-only">District: </span>{alert.district}
            </span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${textColor} border-current bg-opacity-20`}>
          SEVERITY: {alert.severity.toUpperCase()}
        </span>
      </div>
      <p className="text-gray-200 text-lg font-medium leading-relaxed">
        {alert.message}
      </p>
    </div>
  );
};

export default React.memo(AlertDisplay);