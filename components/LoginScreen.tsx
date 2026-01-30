import React, { useState } from 'react';
import { Lock, User, ShieldCheck, ChevronRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (email: string) => void;
  isProcessing: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isProcessing }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    // Strict email validation regex
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // SECURITY: Input sanitization and validation
    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();

    if (!trimmedEmail || !trimmedPass) {
      setError('Credentials required for access.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Invalid operator ID format.');
      return;
    }

    if (trimmedPass.length < 6) {
        setError('Passcode must be at least 6 characters.');
        return;
    }

    setError('');
    onLogin(trimmedEmail);
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md p-8 bg-grid-800 border border-gray-700 rounded-xl shadow-2xl relative overflow-hidden group">
        
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
            style={{ 
                backgroundImage: 'linear-gradient(to right, #0ea5e9 1px, transparent 1px), linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }}>
        </div>

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex p-4 bg-grid-900 rounded-full border border-gray-700 mb-4 shadow-[0_0_20px_rgba(14,165,233,0.1)]">
            <Lock className="w-8 h-8 text-grid-accent" />
          </div>
          <h2 className="text-2xl font-bold font-mono text-white mb-2">SECURE ACCESS</h2>
          <p className="text-gray-400 text-sm">Restricted to authorized Grid Operators</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10" noValidate>
          <div>
            <label htmlFor="email" className="block text-xs font-mono text-gray-500 uppercase mb-2">Operator ID / Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-grid-900 border border-gray-700 rounded p-3 pl-10 text-white font-mono focus:border-grid-accent focus:ring-1 focus:ring-grid-accent outline-none transition-colors"
                placeholder="operator@grid.city"
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-mono text-gray-500 uppercase mb-2">Passcode</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-grid-900 border border-gray-700 rounded p-3 pl-10 text-white font-mono focus:border-grid-accent focus:ring-1 focus:ring-grid-accent outline-none transition-colors"
                placeholder="••••••••"
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div id="login-error" className="p-2 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-xs font-mono text-center" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className={`
              w-full p-4 rounded bg-grid-accent text-white font-bold tracking-wider uppercase flex items-center justify-center space-x-2
              hover:bg-sky-600 transition-colors shadow-[0_0_15px_rgba(14,165,233,0.3)]
              ${isProcessing ? 'opacity-50 cursor-wait' : ''}
            `}
          >
            {isProcessing ? (
              <span>AUTHENTICATING...</span>
            ) : (
              <>
                <span>ESTABLISH UPLINK</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[10px] text-gray-600 font-mono">
            UNAUTHORIZED ACCESS IS PROHIBITED BY SMART CITY ORDINANCE 404.2
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LoginScreen);