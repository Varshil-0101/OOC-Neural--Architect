
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../constants';

interface AuthViewProps {
  mode: 'login' | 'signup';
  onSuccess: () => void;
  onBack: () => void;
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

const AuthView: React.FC<AuthViewProps> = ({ mode, onSuccess, onBack, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mocking authentication delay
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 1200);
  };

  const handleForgotPassword = () => {
    const recoveryEmail = prompt("Please enter your Neuro-ID (Email) for identity recovery:");
    if (recoveryEmail) {
      alert(`A recovery sequence has been initialized for ${recoveryEmail}. Please check your secure inbox.`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-3xl" onClick={onBack} />
      
      <motion.div 
        key={mode} 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-12 rounded-[3rem] shadow-2xl relative z-10 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20">
            <Icons.User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            {mode === 'login' ? 'Synchronize Node' : 'Register Identity'}
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            {mode === 'login' ? 'Enter your credentials to continue' : 'Establish a new neural link'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Neuro-ID (Email)</label>
            <input 
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
              placeholder="architect@synapse.io"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Encryption Key</label>
              {mode === 'login' && (
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
                >
                  Forgot Key?
                </button>
              )}
            </div>
            <input 
              required
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
              placeholder="••••••••"
            />
          </div>

          <button 
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              mode === 'login' ? 'Enter System' : 'Create Access'
            )}
          </button>
        </form>

        <div className="pt-6 border-t border-white/5 flex items-center justify-between gap-4">
          <div className="flex-1 whitespace-nowrap">
            {mode === 'login' ? (
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                New?{' '}
                <button 
                  onClick={() => onSwitchMode('signup')}
                  className="text-indigo-400 font-black hover:text-indigo-300 transition-colors ml-1"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                Known?{' '}
                <button 
                  onClick={() => onSwitchMode('login')}
                  className="text-indigo-400 font-black hover:text-indigo-300 transition-colors ml-1"
                >
                  Log In
                </button>
              </p>
            )}
          </div>
          
          <button 
            onClick={onBack}
            className="text-slate-600 font-black text-[10px] uppercase tracking-widest hover:text-slate-400 transition-colors border border-white/5 px-4 py-2 rounded-full hover:bg-white/5 whitespace-nowrap"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthView;
