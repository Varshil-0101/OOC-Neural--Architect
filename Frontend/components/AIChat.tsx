
import React, { useState, useRef, useEffect } from 'react';
import { Course, Note } from '../types';
import { geminiService } from '../services/geminiService';
import { Icons } from '../constants';

interface AIChatProps {
  currentCourse: Course;
  allNotes: Note[];
  onRequireAuth: () => void;
  isGuest: boolean;
}

const AIChat: React.FC<AIChatProps> = ({ currentCourse, allNotes, onRequireAuth, isGuest }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (isGuest) {
      onRequireAuth();
      return;
    }
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    
    setIsTyping(true);
    try {
      const response = await geminiService.chat(currentCourse, allNotes, userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I encountered an error." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 relative">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
            <Icons.Chat className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{currentCourse.name} AI</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Assistant Online</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-20 px-10">
            <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
              <Icons.Brain className="w-8 h-8" />
            </div>
            <p className="text-slate-400 font-medium leading-relaxed">
              Ask me anything about {currentCourse.name}. I can reference your {allNotes.length} notes.
            </p>
            {isGuest && (
              <p className="mt-4 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Authentication Required for AI Processing</p>
            )}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-slate-800 text-slate-200 border border-white/5'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl px-4 py-3 flex gap-1">
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-6">
        <div className="relative">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={isGuest ? "Sign in to query the architect..." : "Type your question..."}
            className={`w-full bg-slate-800 border border-white/5 rounded-2xl py-4 pl-6 pr-14 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600 ${isGuest ? 'cursor-not-allowed opacity-50' : ''}`}
            disabled={isGuest}
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 rounded-xl flex items-center justify-center text-white hover:bg-indigo-500 transition-colors shadow-lg"
          >
            <Icons.ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
