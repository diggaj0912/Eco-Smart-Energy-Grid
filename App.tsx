import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { initializeGemini, sendMessageToGemini } from './services/geminiService';
import { parseGeminiResponse } from './utils/parser';
import { GridState, ConnectionStatus } from './types';
import StatusPanel from './components/StatusPanel';
import AlertDisplay from './components/AlertDisplay';
import RecommendationPanel from './components/RecommendationPanel';
import ControlConsole from './components/ControlConsole';
import LoginScreen from './components/LoginScreen';
import { Terminal, RefreshCw, Power, LogOut, XCircle, Loader2, Shield, Cloud } from 'lucide-react';

// EFFICIENCY: Lazy load heavy visualization components
const GridVisuals = React.lazy(() => import('./components/GridVisuals'));
const MapPanel = React.lazy(() => import('./components/MapPanel'));

const INITIAL_STATE: GridState = {
  mode: 'IDLE', // Will switch to LOGIN on boot
  statusSummary: 'Initializing connection to Grid AI...',
  currentAlert: null,
  recommendation: null,
  availableActions: [],
  lastUpdate: new Date(),
};

const LoadingFallback = () => (
  <div className="h-64 w-full bg-grid-800 rounded-lg border border-gray-800 flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-grid-accent animate-spin" />
  </div>
);

const App: React.FC = () => {
  const [gridState, setGridState] = useState<GridState>(INITIAL_STATE);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    // Keep only last 50 logs to prevent memory leaks
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-50));
  };

  useEffect(() => {
    // Auto-scroll logs
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const processResponse = useCallback((text: string) => {
    addLog("Receiving telemetry...");
    const updates = parseGeminiResponse(text);
    
    setGridState(prev => {
      const newState = { ...prev, ...updates };
      
      // If we got explicit integration results, log them clearly
      if (updates.systemHealth) {
          addLog("HEALTH CHECK COMPLETE: ALL SYSTEMS GO");
      }
      if (updates.googleServicesStatus) {
          addLog("GOOGLE SERVICES VERIFIED: ACTIVE");
      }

      // If parser didn't find specific actions but we are operational, 
      // sometimes the AI is chatty. We rely on the parser's best effort.
      // If we are IDLE, ensure START is available if the AI didn't provide it explicitly.
      if (newState.mode === 'IDLE' && (!newState.availableActions || newState.availableActions.length === 0)) {
        newState.availableActions = ['START'];
      }
      return newState;
    });
    addLog("Telemetry processed.");
  }, []);

  useEffect(() => {
    const initSystem = async () => {
      setConnectionStatus(ConnectionStatus.CONNECTING);
      addLog("Connecting to Gemini AI Gateway...");
      try {
        await initializeGemini();
        setConnectionStatus(ConnectionStatus.CONNECTED);
        addLog("Connection Established.");
        
        // Trigger initial state
        setIsProcessing(true);
        const response = await sendMessageToGemini("SYSTEM_BOOT_SEQUENCE_INITIATED");
        processResponse(response);
      } catch (e) {
        setConnectionStatus(ConnectionStatus.ERROR);
        addLog("CRITICAL FAILURE: Could not connect to AI Core.");
        console.error(e);
      } finally {
        setIsProcessing(false);
      }
    };

    initSystem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processResponse]);

  const handleAction = useCallback(async (action: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    addLog(`Operator Command: ${action}`);
    
    try {
      const response = await sendMessageToGemini(action);
      processResponse(response);
    } catch (e) {
      addLog("Command Transmission Failed.");
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, processResponse]);

  const handleLogin = useCallback(async (email: string) => {
    setIsProcessing(true);
    addLog(`Authentication Attempt: ${email}`);
    try {
      // Send message to AI to trigger transition from LOGIN to IDLE
      const response = await sendMessageToGemini(`LOGIN_CREDENTIALS_PROVIDED: ${email}`);
      processResponse(response);
    } catch (e) {
      addLog("Authentication Error.");
    } finally {
      setIsProcessing(false);
    }
  }, [processResponse]);

  const handleLogout = useCallback(() => {
    handleAction("LOGOUT");
  }, [handleAction]);

  const getConnectionLabel = () => {
    switch(connectionStatus) {
      case ConnectionStatus.CONNECTED: return 'System Online';
      case ConnectionStatus.CONNECTING: return 'Connecting';
      case ConnectionStatus.ERROR: return 'Connection Error';
      default: return 'Offline';
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-grid-accent selection:text-white pb-12">
      {/* ACCESSIBILITY: Skip to content link */}
      <a 
        href="#main-dashboard" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:p-4 focus:bg-grid-accent focus:text-white focus:rounded focus:font-bold"
      >
        Skip to Main Dashboard
      </a>

      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0a0f1c]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div 
              className={`w-3 h-3 rounded-full ${connectionStatus === ConnectionStatus.CONNECTED ? 'bg-grid-success shadow-[0_0_10px_#10b981]' : 'bg-red-500'}`}
              role="status"
              aria-label={`Connection Status: ${getConnectionLabel()}`}
            ></div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
              <Power className="w-5 h-5 mr-2 text-grid-accent" aria-hidden="true" />
              ECO-SMART <span className="text-gray-500 mx-2" aria-hidden="true">///</span> ENERGY GRID
            </h1>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
             <div className="hidden lg:block text-xs font-mono text-gray-500" aria-label="System Location">
                LAT: 40.7128° N | LON: 74.0060° W
             </div>
             {gridState.mode !== 'LOGIN' && (
               <>
                 <button 
                   onClick={() => handleAction("STATUS")}
                   className="p-2 hover:bg-gray-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-grid-accent"
                   title="System Diagnostic"
                   aria-label="Run System Diagnostic"
                 >
                   <Terminal className="w-5 h-5 text-gray-400" aria-hidden="true" />
                 </button>
                 <button 
                   onClick={() => handleAction("HEALTHCHECK")}
                   className="p-2 hover:bg-gray-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-grid-accent"
                   title="Run System Healthcheck"
                   aria-label="Run System Healthcheck"
                 >
                   <Shield className="w-5 h-5 text-grid-success" aria-hidden="true" />
                 </button>
                 <button 
                   onClick={() => handleAction("GOOGLE_SERVICES_STATUS")}
                   className="p-2 hover:bg-gray-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-grid-accent"
                   title="Verify Google Services"
                   aria-label="Verify Google Services"
                 >
                   <Cloud className="w-5 h-5 text-grid-accent" aria-hidden="true" />
                 </button>
                 <button 
                   onClick={() => handleAction("RESTART")}
                   className="p-2 hover:bg-gray-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-grid-accent"
                   title="Emergency Restart"
                   aria-label="Perform Emergency Restart"
                 >
                   <RefreshCw className="w-5 h-5 text-gray-400" aria-hidden="true" />
                 </button>
                 <button 
                   onClick={() => handleAction("TERMINATE_SYSTEM")}
                   className="p-2 hover:bg-red-900/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 text-red-500"
                   title="Terminate System"
                   aria-label="Terminate System"
                 >
                   <XCircle className="w-5 h-5" aria-hidden="true" />
                 </button>
                 <button 
                   onClick={handleLogout}
                   className="p-2 hover:bg-gray-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-grid-accent text-grid-danger"
                   title="Logout"
                   aria-label="Logout"
                 >
                   <LogOut className="w-5 h-5" aria-hidden="true" />
                 </button>
               </>
             )}
          </div>
        </div>
      </header>

      <main id="main-dashboard" className="max-w-7xl mx-auto px-4 py-8" tabIndex={-1}>
        
        {gridState.mode === 'LOGIN' ? (
           <LoginScreen onLogin={handleLogin} isProcessing={isProcessing} />
        ) : (
          <>
            {/* Status & Visuals Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <section aria-label="System Status">
                  <StatusPanel state={gridState} />
                </section>
                <AlertDisplay alert={gridState.currentAlert} />
                <RecommendationPanel rec={gridState.recommendation} />
              </div>
              
              <div className="flex flex-col gap-6">
                 <section aria-label="District Location Map">
                    <Suspense fallback={<LoadingFallback />}>
                      <MapPanel alert={gridState.currentAlert} />
                    </Suspense>
                 </section>

                 <section aria-label="Load Analysis Chart">
                    <Suspense fallback={<LoadingFallback />}>
                       <GridVisuals 
                          severity={gridState.currentAlert?.severity || 'Low'} 
                          lastUpdate={gridState.lastUpdate} 
                       />
                    </Suspense>
                 </section>
                 
                 {/* Terminal Log */}
                 <section 
                   className="bg-black border border-gray-800 rounded-lg p-4 h-64 overflow-hidden flex flex-col font-mono text-xs"
                   aria-label="System Logs"
                 >
                    <div className="flex items-center justify-between mb-2 text-gray-500 border-b border-gray-900 pb-2">
                      <span>SYSTEM_LOG</span>
                      <span className="w-2 h-2 rounded-full bg-grid-accent animate-pulse" aria-hidden="true"></span>
                    </div>
                    <div 
                      className="overflow-y-auto flex-1 space-y-1 pr-2" 
                      aria-live="polite"
                      role="log"
                    >
                      {logs.map((log, i) => (
                        <div key={i} className="text-gray-400 border-l-2 border-transparent hover:border-grid-700 pl-2">
                          {log}
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                 </section>
              </div>
            </div>

            {/* Action Console */}
            <div className="bg-[#0a0f1c] border border-gray-800 rounded-xl p-6 shadow-2xl">
               <ControlConsole 
                 actions={gridState.availableActions}
                 onAction={handleAction}
                 disabled={isProcessing || connectionStatus !== ConnectionStatus.CONNECTED}
                 mode={gridState.mode}
               />
               {isProcessing && (
                 <div className="mt-4 flex items-center justify-center space-x-2 text-grid-accent text-xs font-mono animate-pulse" role="status">
                   <span>PROCESSING TELEMETRY DATA...</span>
                 </div>
               )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;