import React from 'react';
import { GridState } from '../types';
import { Activity, ShieldCheck, ShieldAlert, Cpu, Database, HardDrive, MapPin, Lock } from 'lucide-react';

interface StatusPanelProps {
  state: GridState;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ state }) => {
  const isOperational = state.mode === 'OPERATIONAL';
  const isDiagnostic = state.mode === 'DIAGNOSTIC';
  
  if (isDiagnostic && state.diagnostics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" role="region" aria-label="Diagnostic Metrics">
        <div className="md:col-span-4 bg-grid-800 border border-gray-700 rounded-lg p-4 flex items-center justify-between shadow-lg">
           <div className="flex items-center">
             <div className="p-2 bg-gray-800 rounded-lg border border-gray-600 mr-4">
               <Cpu className="text-gray-200 w-6 h-6" aria-hidden="true" />
             </div>
             <div>
               <h2 className="text-gray-400 text-xs uppercase tracking-wider font-mono">Operational State</h2>
               <p className="text-xl font-bold font-mono text-white">{state.diagnostics.operationalState}</p>
             </div>
           </div>
           <div className="text-right">
             <h2 className="text-gray-400 text-xs uppercase tracking-wider font-mono">Auth Status</h2>
             <p className="text-lg font-mono text-grid-accent flex items-center justify-end gap-2">
                <Lock className="w-4 h-4" /> {state.diagnostics.authState}
             </p>
           </div>
        </div>

        <div className="bg-grid-900 border border-gray-800 rounded-lg p-4">
           <div className="flex items-center space-x-2 mb-2 text-gray-400">
             <Activity className="w-4 h-4" aria-hidden="true" />
             <span className="text-xs font-mono uppercase">Total Alerts</span>
           </div>
           <p className="text-2xl font-bold font-mono text-grid-success">{state.diagnostics.totalAlertsProcessed}</p>
        </div>

        <div className="bg-grid-900 border border-gray-800 rounded-lg p-4">
           <div className="flex items-center space-x-2 mb-2 text-gray-400">
             <Database className="w-4 h-4" aria-hidden="true" />
             <span className="text-xs font-mono uppercase">Cached Entries</span>
           </div>
           <p className="text-2xl font-bold font-mono text-grid-warning">{state.diagnostics.cachedEntries}</p>
        </div>

        <div className="bg-grid-900 border border-gray-800 rounded-lg p-4 md:col-span-2">
           <div className="flex items-center space-x-2 mb-2 text-gray-400">
             <MapPin className="w-4 h-4" aria-hidden="true" />
             <span className="text-xs font-mono uppercase">Last District Analyzed</span>
           </div>
           <p className="text-lg font-bold font-mono text-white truncate" title={state.diagnostics.lastDistrictAnalyzed}>
             {state.diagnostics.lastDistrictAnalyzed}
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" role="region" aria-label="Current System Status">
      {/* Main Status */}
      <div className="bg-grid-800 border border-gray-700 rounded-lg p-4 flex items-center shadow-lg relative overflow-hidden group">
        <div className={`absolute inset-0 opacity-10 ${isOperational ? 'bg-grid-accent' : 'bg-gray-500'}`} aria-hidden="true"></div>
        <div className="p-3 bg-grid-900 rounded-full mr-4 border border-gray-700">
           {isOperational ? (
             <Activity className="text-grid-accent w-6 h-6 animate-pulse" aria-hidden="true" />
           ) : (
             <Cpu className="text-gray-400 w-6 h-6" aria-hidden="true" />
           )}
        </div>
        <div>
          <h2 className="text-gray-400 text-xs uppercase tracking-wider font-mono">System Mode</h2>
          <p className={`text-xl font-bold font-mono ${isOperational ? 'text-grid-accent' : 'text-gray-300'}`}>
            {state.mode}
          </p>
        </div>
      </div>

      {/* Grid Health */}
      <div className="bg-grid-800 border border-gray-700 rounded-lg p-4 flex items-center shadow-lg">
        <div className="p-3 bg-grid-900 rounded-full mr-4 border border-gray-700">
          {state.currentAlert?.severity === 'High' ? (
            <ShieldAlert className="text-grid-danger w-6 h-6 animate-bounce" aria-hidden="true" />
          ) : (
            <ShieldCheck className="text-grid-success w-6 h-6" aria-hidden="true" />
          )}
        </div>
        <div>
          <h2 className="text-gray-400 text-xs uppercase tracking-wider font-mono">Grid Health</h2>
          <p className={`text-xl font-bold font-mono ${state.currentAlert?.severity === 'High' ? 'text-grid-danger' : 'text-grid-success'}`}>
            {state.currentAlert?.severity === 'High' ? 'CRITICAL' : state.currentAlert?.severity === 'Medium' ? 'UNSTABLE' : 'NOMINAL'}
          </p>
        </div>
      </div>

      {/* Last Update */}
      <div className="bg-grid-800 border border-gray-700 rounded-lg p-4 flex items-center shadow-lg">
        <div className="flex-1">
          <h2 className="text-gray-400 text-xs uppercase tracking-wider font-mono mb-1">Latest Telemetry</h2>
          <div className="font-mono text-sm text-gray-300 line-clamp-3">
             {state.statusSummary || "Waiting for stream..."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(StatusPanel);